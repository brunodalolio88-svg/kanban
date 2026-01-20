// GET: Buscar tarefas
export async function onRequestGet(context) {
    const { env, request } = context;
    const url = new URL(request.url);
    const projectId = url.searchParams.get('projectId');

    let query = "SELECT * FROM tasks ORDER BY created_at DESC";
    let params = [];

    if (projectId) {
        query = "SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC";
        params = [projectId];
    }

    const { results } = await env.DB.prepare(query).bind(...params).all();
    return new Response(JSON.stringify(results), { headers: { 'Content-Type': 'application/json' } });
}

// POST: Criar Tarefa
export async function onRequestPost(context) {
    const { request, env } = context;
    const body = await request.json(); 

    await env.DB.prepare(
        "INSERT INTO tasks (project_id, title, status, due_date) VALUES (?, ?, ?, ?)"
    ).bind(body.projectId, body.title, body.status || 'todo', body.date).run();

    return new Response(JSON.stringify({ success: true }), { status: 201 });
}

// PUT: Atualizar Tarefa (Status OU Edição Completa)
export async function onRequestPut(context) {
    const { request, env } = context;
    const body = await request.json(); // { id, status, title, date }

    // Cenário 1: Apenas arrastou (Mudar Status)
    if (body.status && !body.title) {
        await env.DB.prepare("UPDATE tasks SET status = ? WHERE id = ?")
            .bind(body.status, body.id).run();
    } 
    // Cenário 2: Edição completa (Clicou para editar)
    else if (body.title && body.date) {
        await env.DB.prepare("UPDATE tasks SET title = ?, due_date = ? WHERE id = ?")
            .bind(body.title, body.date, body.id).run();
    }

    return new Response(JSON.stringify({ success: true }), { headers: { 'Content-Type': 'application/json' } });
}

// DELETE: Apagar Tarefa
export async function onRequestDelete(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    await env.DB.prepare("DELETE FROM tasks WHERE id = ?").bind(id).run();
    return new Response(JSON.stringify({ success: true }));
}
