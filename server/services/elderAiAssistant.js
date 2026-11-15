const prisma = require('../db/prisma');
const config = require('../config');

async function handleElderAssistantQuery(elderProfileId, userMessage) {
  const profile = await prisma.elderProfile.findUnique({
    where: { id: elderProfileId },
    include: {
      user: true,
      medications: { where: { isActive: true } },
      doseSchedules: {
        where: {
          scheduledFor: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lte: new Date(new Date().setHours(23, 59, 59, 999))
          }
        },
        include: { medication: true }
      },
      appointments: {
        where: { scheduledAt: { gte: new Date() } },
        orderBy: { scheduledAt: 'asc' },
        take: 3
      }
    }
  });

  if (!profile) {
    throw new Error('Elder profile not found');
  }

  // Save user's question to chat history
  await prisma.assistantChat.create({
    data: {
      elderProfileId,
      sender: 'USER',
      message: userMessage
    }
  });

  const now = new Date();
  const todayDosesSummary = profile.doseSchedules.map(d => (
    `- ${d.medication.name} (${d.medication.dosage}): Due at ${new Date(d.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Status: ${d.status}, Instructions: "${d.medication.instructions}"`
  )).join('\n') || 'None scheduled for today.';

  const appointmentsSummary = profile.appointments.map(a => (
    `- ${a.doctorName} (${a.specialty || 'General'}) at ${new Date(a.scheduledAt).toLocaleDateString()} ${new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Location: ${a.location || 'Clinic'}`
  )).join('\n') || 'No upcoming appointments scheduled.';

  const systemContext = `You are "Sathi", an empathetic, respectful, and dignified AI health companion for a senior citizen named ${profile.user.name}.
Your job is to assist them with their daily medication, routine, diet precautions, and doctor visits.

PATIENT LIVE HEALTH CONTEXT:
- Senior Name: ${profile.user.name}
- Medical Notes: ${profile.medicalNotes || 'Standard senior care'}
- Emergency Phone: ${profile.emergencyPhone || 'Not specified'}
- Today's Schedule (${now.toLocaleDateString()}):
${todayDosesSummary}
- Upcoming Doctor Appointments:
${appointmentsSummary}

STRICT GUARDRAILS & INSTRUCTIONS:
1. ONLY answer questions directly related to:
   - What medicines to take and when.
   - How to take them (with food, water, morning/night).
   - When their next doctor appointment is.
   - General elder wellness, hydration, and light meals (e.g. dalia, khichdi, warm water, low salt).
2. IF the senior asks about ANY external, political, technical, coding, or unrelated topic, politely deflect with:
   "Main aapka SehatSathi saathi hoon. Main sirf aapki dawaiyon, doctor visits, aur rozana sehat ke baare mein baat kar sakta hoon."
3. Keep replies SHORT, calm, and easily readable (maximum 2 to 4 sentences).
4. If they complain of severe pain, dizziness, or emergency, advise them:
   "Kripya turant upar diye gaye Emergency Call button se apne parivaar ya doctor se sampark karein."
5. Speak in warm, respectful language (Hindi / Hinglish / English matching the user's greeting).`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `${systemContext}\n\nSenior asked: "${userMessage}"\n\nAssistant reply:` }
          ]
        }
      ]
    }),
    signal: AbortSignal.timeout(10000)
  });

  let assistantReply = "Aapki aglee dawai ka samay check karne ke liye kripya 'Today' tab dekhein.";

  if (response.ok) {
    const data = await response.json();
    assistantReply = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || assistantReply;
  }

  // Save assistant reply to chat history
  await prisma.assistantChat.create({
    data: {
      elderProfileId,
      sender: 'ASSISTANT',
      message: assistantReply
    }
  });

  return { reply: assistantReply };
}

module.exports = {
  handleElderAssistantQuery
};

