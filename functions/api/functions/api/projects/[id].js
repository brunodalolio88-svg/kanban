export async function onRequestDelete(context) {
    const { request, env, params } = context;
    const projectId = params.id;
    const body = await request.json(); // Aqui vem o { confirmName: "..." }

    // 1. Busca o projeto para conferir o nome
    const project = await env.DB.prepare(
        "SELECT name FROM projects WHERE id = ?"
    ).bind(projectId).first();

    if (!project) return new Response("Projeto não encontrado", { status: 404 });

    // 2. Trava de Segurança
    if (project.name !== body.confirmName) {
        return new Response(JSON.stringify({ 
            error: "O nome digitado não confere. O projeto NÃO foi deletado." 
        }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    // 3. Deleta tarefas, arquivos e o projeto (Batch para garantir que tudo suma)
    await env.DB.batch([
        env.DB.prepare("DELETE FROM tasks WHERE project_id = ?").bind(projectId),
        env.DB.prepare("DELETE FROM files WHERE project_id = ?").bind(projectId),
        env.DB.prepare("DELETE FROM projects WHERE id = ?").bind(projectId)
    ]);

    return new Response(JSON.stringify({ message: "Deletado com sucesso" }), {
        headers: { 'Content-Type': 'application/json' }
    });
}
