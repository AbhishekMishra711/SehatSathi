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
  const activeMedsList = profile.medications.map(m => (
    `- ${m.name} (${m.dosage}): Frequency: ${m.frequency}, Instructions: "${m.instructions}", Scheduled time slots: [${m.timeSlots.join(', ')}]`
  )).join('\n');

  const todayDosesList = profile.doseSchedules.map(d => (
    `- ${d.medication.name} (${d.medication.dosage}): Due at ${new Date(d.scheduledFor).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Status: ${d.status}, Instructions: "${d.medication.instructions}"`
  )).join('\n');

  const appointmentsList = profile.appointments.map(a => (
    `- Dr. ${a.doctorName} (${a.specialty || 'General'}) on ${new Date(a.scheduledAt).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })} at ${new Date(a.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, Location: ${a.location || 'Clinic'}`
  )).join('\n');

  const hasAnyMedications = profile.medications.length > 0 || profile.doseSchedules.length > 0;
  const hasAppointments = profile.appointments.length > 0;

  const systemPrompt = `You are a respectful health companion for a senior named ${profile.user.name}.
Your duty is to assist them with their daily medication, routine, light meals, and doctor visits with absolute accuracy.

ELDER LIVE HEALTH CONTEXT (GROUND TRUTH - ONLY RELY ON THIS DATA):
- Senior Name: ${profile.user.name}
- Medical Notes: ${profile.medicalNotes || 'Standard senior care'}
- Emergency Phone: ${profile.emergencyPhone || 'Not specified'}
- All Active Prescribed Medications:
${hasAnyMedications ? (activeMedsList || todayDosesList) : 'NO MEDICATIONS ASSIGNED.'}
- Today's Dose Schedule (${now.toLocaleDateString()}):
${todayDosesList || 'No specific doses scheduled for today.'}
- Upcoming Doctor Appointments:
${hasAppointments ? appointmentsList : 'No upcoming appointments scheduled.'}

CRITICAL ANTI-HALLUCINATION & SAFETY RULES:
1. STRICT ZERO-HALLUCINATION POLICY:
   - If NO medications are assigned (${!hasAnyMedications}), you MUST explicitly state that there are currently no medicines assigned in their profile, and advise them to consult their family caretaker or doctor before taking anything.
   - NEVER invent, suggest, assume, or hallucinate ANY medicine name (no Paracetamol, Aspirin, Metformin, etc.) that is NOT explicitly listed in the elder's ground truth above.
2. NATURAL HUMAN CONVERSATION (NO RAW DATA DUMPS):
   - Do NOT spit out raw database strings, JSON, or robotic lists.
   - Formulate your answer as a caring, warm human companion speaking to an elder (e.g., "Namaste Ramesh ji, aaj subah 8 baje aapko Metformin lene ka samay hai...").
3. STRICT LANGUAGE MATCHING:
   - If the senior asks in Hinglish (Roman script Hindi like "kya dawai khana hai", "meri dawai batao"), reply in warm, respectful Hinglish.
   - If the senior asks in English (e.g. "What medicines do I have today?", "When is my appointment?"), reply STRICTLY in gentle, clear English. DO NOT reply in Hindi/Hinglish when the question is in English!
   - If the senior asks in Hindi script (Devanagari), reply in pure Hindi.
4. SCOPE BOUNDARIES:
   - Only discuss medications, doctor visits, hydration, and light senior diet (khichdi, warm water, low sodium).
   - If asked about politics, technology, code, or unrelated topics, politely say:
     "Main aapka SehatSathi hoon. Main sirf aapki dawaiyon, doctor visits, aur rozana sehat ke baare mein baat kar sakta hoon." (or English equivalent).
5. EMERGENCY PROTOCOL:
   - If they report acute chest pain, breathlessness, fall, or severe dizziness, urge them immediately:
     "Kripya turant upar diye gaye Emergency Call button se apne parivaar ya doctor se sampark karein."
6. Keep answers concise (2 to 3 sentences max) so they are easy to read and listen to.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.geminiModel}:generateContent?key=${config.geminiApiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemPrompt}\n\nElder Query: "${userMessage}"\n\nAnswer:` }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 250
      }
    }),
    signal: AbortSignal.timeout(10000)
  });

  let assistantReply = hasAnyMedications
    ? "Aapki aglee dawai ka samay check karne ke liye kripya 'Today' ya 'All Medicines' tab dekhein."
    : "Aapki profile mein abhi koi dawai assign nahi hai. Kripya apne caretaker ya doctor se sampark karein.";

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

