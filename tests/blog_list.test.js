const blogListHelper = require('../utils/blog_list_helper');

test('dummy is called', () => {
    const blogs = [];

    const result = blogListHelper.dummy(blogs);
    expect(result).toBe(1);
});