const { test, expect, beforeEach, describe } = require('@playwright/test')

describe('Blog app', () => {
    beforeEach(async ({ page, request }) => {
        // Reset the database before each test
        await request.post('http://localhost:3003/api/testing/reset')

        const newUser = {
            name: 'Pablo Test',
            username: 'pablo',
            password: 'sekret'
        }

        await request.post('http://localhost:3003/api/users', {
            data: newUser
        })

        await page.goto('http://localhost:5173')
    })

    test('Login form is shown', async ({ page }) => {
        await expect(page.getByRole('heading', { name: /blogs/i })).toBeVisible()
        await expect(page.locator('input[name="Username"]')).toBeVisible()
        await expect(page.locator('input[name="Password"]')).toBeVisible()
        await expect(page.getByRole('button', { name: /login/i })).toBeVisible()
    })

    describe('Login', () => {
        test('succeeds with correct credentials', async ({ page }) => {
            await page.locator('input[name="Username"]').fill('pablo')
            await page.locator('input[name="Password"]').fill('sekret')
            await page.getByRole('button', { name: /login/i }).click()

            await expect(page.getByText('Pablo Test logged in')).toBeVisible()
        })

        test('fails with wrong credentials', async ({ page }) => {
            await page.locator('input[name="Username"]').fill('pablo')
            await page.locator('input[name="Password"]').fill('wrong')
            await page.getByRole('button', { name: /login/i }).click()

            await expect(page.getByText('wrong username or password')).toBeVisible()
            await expect(page.getByText('Pablo Test logged in')).not.toBeVisible()
        })
    })

    test('a new blog can be created', async ({ page }) => {

        await page.locator('input[name="Username"]').fill('pablo')
        await page.locator('input[name="Password"]').fill('sekret')
        await page.getByRole('button', { name: /login/i }).click()

        await page.getByRole('button', { name: /new blog/i }).click()

        await page.locator('input[name="Title"]').fill('Blog de prueba')
        await page.locator('input[name="Author"]').fill('Autor de prueba')
        await page.locator('input[name="Url"]').fill('http://prueba.com')

        await page.getByRole('button', { name: /create/i }).click()

        await expect(page.getByText('Blog de prueba').first()).toBeVisible()
    })

    test('blog details can be viewed and blog can be edited (liked)', async ({ page }) => {
        // login
        await page.locator('input[name="Username"]').fill('pablo')
        await page.locator('input[name="Password"]').fill('sekret')
        await page.getByRole('button', { name: /login/i }).click()

        // create blog
        await page.getByRole('button', { name: /new blog/i }).click()
        await page.locator('input[name="Title"]').fill('Blog editable')
        await page.locator('input[name="Author"]').fill('Editor')
        await page.locator('input[name="Url"]').fill('http://edit.com')
        await page.getByRole('button', { name: /create/i }).click()

        // click first view button
        await page.getByRole('button', { name: /view/i }).first().click()

        // validate that like button is visible
        await expect(page.getByRole('button', { name: /like/i })).toBeVisible()
    })

    test('creator can delete their own blog', async ({ page }) => {
        // Login
        await page.locator('input[name="Username"]').fill('pablo')
        await page.locator('input[name="Password"]').fill('sekret')
        await page.getByRole('button', { name: /login/i }).click()

        // Crete blog
        await page.getByRole('button', { name: /new blog/i }).click()
        await page.locator('input[name="Title"]').fill('Blog deletable')
        await page.locator('input[name="Author"]').fill('Author deletable')
        await page.locator('input[name="Url"]').fill('http://delete.com')
        await page.getByRole('button', { name: /create/i }).click()

        // see details
        await page.getByRole('button', { name: /view/i }).first().click()

        // confirm and delete
        page.once('dialog', dialog => dialog.accept())
        await page.getByRole('button', { name: /remove/i }).click()

        const deletedBlog = page.locator('.blog-item').filter({ hasText: 'Blog deletable Author deletable' })
        await expect(deletedBlog).toHaveCount(0)
    })

    test('only the creator can see the remove button', async ({ page, request, browser }) => {
        // Login as blog creator
        await page.locator('input[name="Username"]').fill('pablo')
        await page.locator('input[name="Password"]').fill('sekret')
        await page.getByRole('button', { name: /login/i }).click()

        // Create a blog
        await page.getByRole('button', { name: /new blog/i }).click()
        await page.locator('input[name="Title"]').fill('Private Blog')
        await page.locator('input[name="Author"]').fill('Author A')
        await page.locator('input[name="Url"]').fill('http://private.com')
        await page.getByRole('button', { name: /create/i }).click()

        // Logout
        await page.evaluate(() => window.localStorage.clear())
        await page.reload()

        // Create a second user
        const secondUser = {
            name: 'Another User',
            username: 'another',
            password: 'pass123'
        }
        await request.post('http://localhost:3003/api/users', { data: secondUser })

        // Login as the second user in a new browser context
        const contextB = await browser.newContext()
        const pageB = await contextB.newPage()
        await pageB.goto('http://localhost:5173')

        await pageB.locator('input[name="Username"]').fill('another')
        await pageB.locator('input[name="Password"]').fill('pass123')
        await pageB.getByRole('button', { name: /login/i }).click()

        // Find the blog item that includes both title and author
        const blog = pageB
            .getByTestId('blog-item')
            .filter({ hasText: 'Private Blog' })
            .filter({ hasText: 'Author A' })
            .first()

        await expect(blog).toBeVisible()

        // Reveal blog details
        await blog.getByRole('button', { name: /view/i }).click()

        // Assert "remove" button is NOT visible to the non-creator
        await expect(blog.getByRole('button', { name: /remove/i })).toHaveCount(0)

        await contextB.close()
    })

    test('blogs are ordered by likes in descending order', async ({ page }) => {
        // Force logout
        await page.goto('http://localhost:5173')
        await page.evaluate(() => localStorage.clear())
        await page.reload()

        // Wait for login fields
        await expect(page.getByRole('textbox', { name: /username/i })).toBeVisible()
        await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible()

        // Log in
        await page.getByRole('textbox', { name: /username/i }).fill('pablo')
        await page.getByRole('textbox', { name: /password/i }).fill('sekret')
        await page.getByRole('button', { name: /login/i }).click()

        // Create blogs with varying likes
        const createBlog = async (title, author, url, likes) => {
            const newBlogButton = page.getByRole('button', { name: /new blog/i })
            await expect(newBlogButton).toBeVisible()
            await newBlogButton.click()

            await page.locator('input[name="Title"]').fill(title)
            await page.locator('input[name="Author"]').fill(author)
            await page.locator('input[name="Url"]').fill(url)
            await page.getByRole('button', { name: /create/i }).click()

            const blog = page.getByTestId('blog-item').filter({ hasText: `${title} ${author}` }).first()
            await expect(blog.getByRole('button', { name: /view/i })).toBeVisible()
            await blog.getByRole('button', { name: /view/i }).click()

            for (let i = 0; i < likes; i++) {
                await blog.getByRole('button', { name: /like/i }).click()
                await page.waitForTimeout(200)
            }
        }

        // Use unique titles to avoid previous test data
        await createBlog('Test Blog C', 'Author C', 'http://most.com', 5)
        await createBlog('Test Blog B', 'Author B', 'http://medium.com', 3)
        await createBlog('Test Blog A', 'Author A', 'http://least.com', 1)

        // Wait to ensure UI updates
        await page.waitForTimeout(500)

        // Expand all blogs
        const allBlogs = await page.getByTestId('blog-item').all()
        for (const blog of allBlogs) {
            const viewBtn = blog.getByRole('button', { name: /view/i })
            if (await viewBtn.isVisible()) {
                await viewBtn.click()
            }
        }

        // Get all likes in order
        const likeCounts = await page.getByTestId('blog-item').evaluateAll((nodes) => {
            return nodes.map((node) => {
                const likeLine = Array.from(node.querySelectorAll('div')).find(div =>
                    div.textContent && div.textContent.toLowerCase().includes('likes')
                )
                const match = likeLine?.textContent.match(/likes\s+(\d+)/i)
                return match ? parseInt(match[1]) : 0
            })
        })

        const sortedLikes = [...likeCounts].sort((a, b) => b - a)
        expect(likeCounts).toEqual(sortedLikes)
    })
})
