const OpenAI = require("openai");
const openai = new OpenAI();

exports.handler = async (event) => {
    let body = {};
    try {
        body = event.body ? JSON.parse(event.body) : {};
    } catch {
        return resp(400, { error: "Invalid JSON body" });
    }

    const specialization = body.specialization || "general medicine";
    const keywords = body.keywords || "";

    const prompt = `
Eres un asistente que sugiere literatura médica basada en PubMed.
Devuélveme exactamente 3 artículos recientes con este formato:
- Título (Año) – DOI – Enlace.

Especialidad: ${specialization}
Palabras clave: ${keywords}
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            temperature: 0.4,
            messages: [{ role: "user", content: prompt }]
        });

        const suggestions = completion.choices[0].message.content.trim();
        return resp(200, { suggestions });
    } catch (err) {
        console.error(err);
        return resp(500, { error: "OpenAI request failed" });
    }
};

function resp(statusCode, body) {
    return {
        statusCode,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
    };
}
