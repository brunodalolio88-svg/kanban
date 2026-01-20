export async function onRequestGet(context) {
    const { env } = context;
    // Pega todos os projetos ordenados pelo mais recente
    const { results } = await env.DB.prepare(
        "SELECT * FROM projects ORDER BY created_at DESC"
    ).all();

    return new Response(JSON.stringify(results), {
        headers: { 'Content-Type': 'application/json' }
    });
}

export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json();

    if (!body.name) return new Response("Nome é obrigatório", { status: 400 });

    const result = await env.DB.prepare(
        "INSERT INTO projects (name) VALUES (?)"
    ).bind(body.name).run();

    return new Response(JSON.stringify({ success: true }), { 
        status: 201, headers: { 'Content-Type': 'application/json' }
    });
}
