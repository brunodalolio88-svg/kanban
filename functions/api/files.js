// GET: Listar arquivos do projeto
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    if (!projectId) return new Response("ProjectId necessário", { status: 400 });

    const { results } = await env.DB.prepare(
        "SELECT * FROM files WHERE project_id = ? ORDER BY added_at DESC"
    ).bind(projectId).all();

    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}

// POST: Salvar novo link
export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json(); // { projectId, name, url, type }

    await env.DB.prepare(
        "INSERT INTO files (project_id, name, url, type) VALUES (?, ?, ?, ?)"
    ).bind(body.projectId, body.name, body.url, body.type).run();

    return new Response(JSON.stringify({ success: true }), { status: 201 });
}

// DELETE: Remover link
export async function onRequestDelete(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    await env.DB.prepare("DELETE FROM files WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
}
