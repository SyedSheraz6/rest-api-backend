const fs = require('fs')
const path = require('path')

const { validationResult } = require('express-validator')

const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
    const currentPage = req.query.page || 1
    const perPage = 2
    let totalItems;
    Post.find().countDocuments()
        .then(count => {
            totalItems = count;
            return Post.find()
                .skip((currentPage - 1) * perPage)
                .limit(perPage)
        })
        .then(posts => {
            res.status(200).json({
                message: 'Fetched all posts',
                posts,
                totalItems
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then((post) => {
            if (!post) {
                const error = new Error('Post not found!')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({
                message: "Fetched post successfully",
                post: post
            })
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Your input values are invalid');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image uploaded');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title
    const content = req.body.content
    let imageUrl = req.file.path
    imageUrl = imageUrl.replace(/\\/g, '/');

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name: 'Sheraz'
        }
    })

    post.save().then(post => {
        res.status(201).json({
            message: 'Post created successfully!',
            post: post
        })
    })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

exports.updatePost = (req, res, next) => {
    console.log('update post', req.body)
    const postId = req.params.postId;

    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        const error = new Error('Your input values are invalid');
        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;
    const content = req.body.content
    let imageUrl = req.body.image

    if (req.file) {
        imageUrl = req.file.path
    }
    console.log('imageUrl', imageUrl)

    if (!imageUrl) {
        const error = new Error('File not picked');
        error.statusCode = 422;
        throw error
    }
    imageUrl = imageUrl.replace(/\\/g, '/');

    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post not found!')
                error.statusCode = 404
                throw error
            }

            if (imageUrl !== post.imageUrl) {
                clearImage(post.imageUrl)
            }

            post.title = title;
            post.content = content;
            post.imageUrl = imageUrl

            return post.save()
        })
        .then(result => {
            res.status(200).json({
                message: 'Post updated!',
                post: result
            })
        })
        .catch(err => {
            console.log(err)
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })

}

exports.deletePost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then(post => {
            if (!post) {
                const error = new Error('Post not found!')
                error.statusCode = 404
                throw error
            }
            clearImage(post.imageUrl)
            return Post.findByIdAndDelete(postId)
        })
        .then(result => {
            res.status(200).json({
                message: 'Post deleted'
            })
        })
        .catch(err => {
            console.log(err)
            if (!err.statusCode) {
                err.statusCode = 500
            }
            next(err)
        })
}

const clearImage = imagePath => {
    const filePath = path.join(__dirname, '..', imagePath)
    fs.unlink(filePath, err => {
        console.log(err)
    })
}