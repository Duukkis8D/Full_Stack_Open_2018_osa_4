const blogListHelper = require('../utils/blog_list_helper');
const { listWithOneBlog, initialBlogs, blogsInDB } = require('./test_helper');

const supertest = require('supertest');
const { app, server } = require('../index');
const api = supertest(app);
const Blog = require('../models/blog');

test('dummy is called', () => {
    const blogs = [];

    const result = blogListHelper.dummy(blogs);
    expect(result).toBe(1);
});

describe('total likes', () => {
    test('when list has only one blog equals the likes of that', () => {
        expect(blogListHelper.totalLikes(listWithOneBlog)).toBe(99);
    });

    test('of a bigger list is calculated right', () => {
        expect(blogListHelper.totalLikes(initialBlogs)).toBe(36);
    });
});

beforeAll(async () => {
    await Blog.deleteMany({});

    const blogObjects = initialBlogs.map(blog => new Blog(blog));
    const promiseArray = blogObjects.map(blog => blog.save());
    await Promise.all(promiseArray);
});

describe('sending and receiving blogs', () => {
    test('blogs are returned as json', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.length).toBe(initialBlogs.length);
    });

    test('a valid blog can be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            author: 'Headhunterz',
            url: 'https://headhunterz.com',
            likes: 99
        };

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(201)
            .expect('Content-Type', /application\/json/);

        const response = await blogsInDB();

        const contents = response.map(blog => blog.title);

        expect(response.length).toBe(initialBlogs.length + 1);
        expect(contents).toContain('Rock Civilization - Life of Headhunterz');
    });

    test('blog without title cannot be added', async () => {
        const newBlog = {
            author: 'Headhunterz',
            url: 'https://headhunterz.com',
            likes: 99
        };

        const blogsAtStart = await blogsInDB();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDB();

        expect(response.length).toBe(blogsAtStart.length);
    });

    test('blog without author cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            url: 'https://headhunterz.com',
            likes: 99
        };

        const blogsAtStart = await blogsInDB();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDB();

        expect(response.length).toBe(blogsAtStart.length);
    });

    test('blog without url cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            author: 'Headhunterz',
            likes: 99
        };

        const blogsAtStart = await blogsInDB();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDB();

        expect(response.length).toBe(blogsAtStart.length);
    });

    test('blog without likes cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            author: 'Headhunterz',
            url: 'https://headhunterz.com'
        };

        const blogsAtStart = await blogsInDB();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDB();

        expect(response.length).toBe(blogsAtStart.length);
    });
});

describe('deletion of a blog', () => {
    let addedBlog;

    beforeAll(async () => {
        addedBlog = await new Blog(
            {
                title: 'Pepper robot use cases',
                author: 'Haruka Unio',
                url: 'http://www.pepperuses.com',
                likes: 675
            }
        ).save();
    });

    test('DELETE /api/blogs/:id succeeds with proper status code', async () => {
        const blogsAtStart = await blogsInDB();

        await api
            .delete(`/api/blogs/${addedBlog._id}`)
            .expect(204);

        const blogsAfterOperation = await blogsInDB();

        const blogTitles = blogsAfterOperation.map(blog => blog.title);

        expect(blogTitles).not.toContain(addedBlog.title);
        expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1);
    });
});

afterAll(() => {
    server.close();
});