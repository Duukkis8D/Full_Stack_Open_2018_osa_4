const blogListHelper = require('../utils/blog_list_helper');
const { listWithOneBlog, initialBlogs, blogsInDb, usersInDb } = require('./test_helper');

const supertest = require('supertest');
const { app, server } = require('../index');
const api = supertest(app);
const Blog = require('../models/blog');
const User = require('../models/user');

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

        const response = await blogsInDb();

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

        const blogsAtStart = await blogsInDb();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDb();

        expect(response.length).toBe(blogsAtStart.length);
    });

    test('blog without author cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            url: 'https://headhunterz.com',
            likes: 99
        };

        const blogsAtStart = await blogsInDb();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDb();

        expect(response.length).toBe(blogsAtStart.length);
    });

    test('blog without url cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            author: 'Headhunterz',
            likes: 99
        };

        const blogsAtStart = await blogsInDb();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDb();

        expect(response.length).toBe(blogsAtStart.length);
    });

    test('blog without likes cannot be added', async () => {
        const newBlog = {
            title: 'Rock Civilization - Life of Headhunterz',
            author: 'Headhunterz',
            url: 'https://headhunterz.com'
        };

        const blogsAtStart = await blogsInDb();

        await api
            .post('/api/blogs')
            .send(newBlog)
            .expect(400);

        const response = await blogsInDb();

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
        const blogsAtStart = await blogsInDb();

        await api
            .delete(`/api/blogs/${addedBlog._id}`)
            .expect(204);

        const blogsAfterOperation = await blogsInDb();

        const blogTitles = blogsAfterOperation.map(blog => blog.title);

        expect(blogTitles).not.toContain(addedBlog.title);
        expect(blogsAfterOperation.length).toBe(blogsAtStart.length - 1);
    });
});

describe('when there is initially one user at db', async () => {
    beforeAll(async () => {
        await User.deleteMany({});
        const user = new User({ username: 'superuser', passwordHash: 'sekret' });
        await user.save();
    });

    test('GET /api/users returns that one user', async () => {
        let returnedUser = await api
            .get('/api/users')
            .expect(200)
            .expect('Content-Type', /application\/json/);

        returnedUser = returnedUser.body[0];
        expect(returnedUser.username).toBe('superuser');
    });

    test('POST /api/users succeeds with a fresh username', async () => {
        const usersBeforeOperation = await usersInDb();

        const newUser = {
            username: 'Duukkis',
            name: 'Tuukka Virtanen',
            passwordHash: 'salainen+1',
            adult: true
        };

        await api
            .post('/api/users')
            .send(newUser)
            .expect(200)
            .expect('Content-Type', /application\/json/);

        const usersAfterOperation = await usersInDb();
        expect(usersAfterOperation.length).toBe(usersBeforeOperation.length+1);
        const usernames = usersAfterOperation.map(u => u.username);
        expect(usernames).toContain(newUser.username);
    });
});

afterAll(() => {
    server.close();
});