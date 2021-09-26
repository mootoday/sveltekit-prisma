import type { Request } from '@sveltejs/kit';
import type { Locals } from '$lib/types';
import PrismaClient from '$lib/prisma';

/*
	This module is used by the /todos.json and /todos/[uid].json
	endpoints to make calls to api.svelte.dev, which stores todos
	for each user. The leading underscore indicates that this is
	a private module, _not_ an endpoint — visiting /todos/_api
	will net you a 404 response.

	(The data on the todo app will expire periodically; no
	guarantees are made. Don't use it to organise your life.)
*/

const prisma = new PrismaClient();

export type Todo = {
	uid: string;
	created_at: Date;
	text: string;
	done: boolean;
};


export async function api(request: Request<Locals>, resource: string, data?: Todo) {
	// user must have a cookie set
	if (!request.locals.userid) {
		return { status: 401 };
	}

	let body = {};
	let status = 500;
	switch (request.method.toUpperCase()) {
		case "DELETE":
			await prisma.todo.delete({
				where: {
					uid: resource.split("/").pop()
				}
			})
			status = 200;
			break;
		case "GET":
			body = await prisma.todo.findMany();
			status = 200;
			break;
		case "PATCH":
			body = await prisma.todo.update({
				data: {
					done: data.done,
					text: data.text
				},
				where: {
					uid: resource.split("/").pop()
				}
			})
			status = 200;
			break;
		case "POST":
			body = await prisma.todo.create({
				data: {
					created_at: new Date(),
					done: false,
					text: data.text,
				}
			})
			status = 201;
			break;
	}

	// if the request came from a <form> submission, the browser's default
	// behaviour is to show the URL corresponding to the form's "action"
	// attribute. in those cases, we want to redirect them back to the
	// /todos page, rather than showing the response
	if (request.method !== 'GET' && request.headers.accept !== 'application/json') {
		return {
			status: 303,
			headers: {
				location: '/todos'
			}
		};
	}

	return {
		status,
		body
	};
}
