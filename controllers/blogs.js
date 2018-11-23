const blogsRouter = require('express').Router();
const Blog = require('../models/blog');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog.find({});
    response.json(blogs);
});

blogsRouter.post('/', async (request, response) => {
    if (request.body.title === undefined) {
        return response.status(400).json({ error: 'title is missing' });
    } else if (request.body.author === undefined) {
        return response.status(400).json({ error: 'author is missing' });
    } else if (request.body.url === undefined) {
        return response.status(400).json({ error: 'url is missing' });
    } else if (request.body.likes === undefined) {
        return response.status(400).json({ error: 'likes is missing' });
    }

    try {
        const blog = new Blog(request.body);
        const savedBlog = await blog.save();
        response.status(201).json(savedBlog);
    } catch (exception) {
        console.log(exception);
        response.status(500).json({ error: 'something went wrong' });
    }
});

blogsRouter.delete('/:id', async (request, response) => {
    try {
        await Blog.deleteOne({ _id: request.params.id });
        response.status(204).end();
    } catch (exception) {
        console.log(exception);
        response.status(400).send({ error: 'malformatted id' });
    }
});

module.exports = blogsRouter;
