const blogListHelper = require('../utils/blog_list_helper');

const supertest = require('supertest');
const { app, server } = require('../index');
const api = supertest(app);
const Blog = require('../models/blog');

test('dummy is called', () => {
    const blogs = [];

    const result = blogListHelper.dummy(blogs);
    expect(result).toBe(1);
});

const listWithOneBlog = [
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
    }
];

const blogs = [
    {
        _id: '5a422a851b54a676234d17f7',
        title: 'React patterns',
        author: 'Michael Chan',
        url: 'https://reactpatterns.com/',
        likes: 7,
        __v: 0
    },
    {
        _id: '5a422aa71b54a676234d17f8',
        title: 'Go To Statement Considered Harmful',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
        likes: 5,
        __v: 0
    },
    {
        _id: '5a422b3a1b54a676234d17f9',
        title: 'Canonical string reduction',
        author: 'Edsger W. Dijkstra',
        url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
        likes: 12,
        __v: 0
    },
    {
        _id: '5a422b891b54a676234d17fa',
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10,
        __v: 0
    },
    {
        _id: '5a422ba71b54a676234d17fb',
        title: 'TDD harms architecture',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
        likes: 0,
        __v: 0
    },
    {
        _id: '5a422bc61b54a676234d17fc',
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
        likes: 2,
        __v: 0
    }
];

describe('total likes', () => {
    test('when list has only one blog equals the likes of that', () => {
        expect(blogListHelper.totalLikes(listWithOneBlog)).toBe(5);
    });

    test('of a bigger list is calculated right', () => {
        expect(blogListHelper.totalLikes(blogs)).toBe(36);
    });
});

beforeAll(async () => {
    await Blog.deleteMany({});

    const blogObjects = blogs.map(blog => new Blog(blog));
    const promiseArray = blogObjects.map(blog => blog.save());
    await Promise.all(promiseArray);
});

describe('sending and receiving blogs', () => {
    test('blogs are returned as json', async () => {
        const response = await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        expect(response.body.length).toBe(blogs.length);
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

        const response = await api
            .get('/api/blogs');

        const contents = response.body.map(blog => blog.title);

        expect(response.body.length).toBe(blogs.length + 1);
        expect(contents).toContain('Rock Civilization - Life of Headhunterz');
    });

    test('blog without title cannot be added', async () => {
        const newBlog = {
            author: 'Headhunterz',
            url: 'https://headhunterz.com',
            likes: 99
        };

        const initialBlogs = await api
            .get('/api/blogs');

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await api
            .get('/api/blogs');

        expect(response.body.length).toBe(initialBlogs.body.length);
    });

    test('blog without author cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            url: 'https://headhunterz.com',
            likes: 99
        };

        const initialBlogs = await api
            .get('/api/blogs');

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await api
            .get('/api/blogs');

        expect(response.body.length).toBe(initialBlogs.body.length);
    });

    test('blog without url cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            author: 'Headhunterz',
            likes: 99
        };

        const initialBlogs = await api
            .get('/api/blogs');

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await api
            .get('/api/blogs');

        expect(response.body.length).toBe(initialBlogs.body.length);
    });

    test('blog without likes cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            author: 'Headhunterz',
            url: 'https://headhunterz.com'
        };

        const initialBlogs = await api
            .get('/api/blogs');

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await api
            .get('/api/blogs');

        expect(response.body.length).toBe(initialBlogs.body.length);
    });
});

afterAll(() => {
    server.close();
});