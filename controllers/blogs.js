const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

blogsRouter.get('/', async (request, response) => {
    const blogs = await Blog
        .find({})
        .populate('user', { _id: 1, username: 1, name: 1 });
    response.json(blogs);
});

const getTokenFrom = (request) => {
    const authorization = request.get('authorization');
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7);
    }
    return null;
};

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

    const body = request.body;

    try {
        const token = getTokenFrom(request);
        const decodedToken = jwt.verify(token, process.env.SECRET);

        if (!token || !decodedToken.id) {
            return response.status(401).json({ error: 'token missing or invalid' });
        }

        const user = await User.findById(decodedToken.id);

        const blog = new Blog({
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes,
            user: user._id
        });
        const savedBlog = await blog.save();

        user.blogs = user.blogs.concat(savedBlog._id);
        await user.save();

        response.status(201).json(savedBlog);
    } catch (exception) {
        if (exception.message === 'JsonWebTokenError') {
            response.status(401).json({ error: exception.message });
        } else {
            console.log(exception);
            response.status(500).json({ error: 'something went wrong' });
        }
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
