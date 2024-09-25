const { validationResult } = require('express-validator')

const Post = require('../models/post')

exports.getPosts = (req, res, next) => {
    Post.find()
        .then(posts => {
            res.status(200).json({
                message:'Fetched all posts',
                posts:posts
            })
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500
            }
            next(err)
        })
}

exports.getPost = (req, res, next) => {
    const postId = req.params.postId
    Post.findById(postId)
        .then((post) => {
            if(!post) {
                const error = new Error('Post not found!')
                error.statusCode = 404
                throw error
            }
            res.status(200).json({
                message:"Fetched post successfully",
                post: post
            })
        })
        .catch(err => {
            if(!err.statusCode){
                err.statusCode = 500
            }
            next(err)
        })
}

exports.createPost = (req, res, next) => {
    const errors = validationResult(req)
    if(!errors.isEmpty()) {
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
    const imageUrl = req.file.path

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: {
            name:'Sheraz'
        }
    })

    post.save().then(post => {
        res.status(201).json({
            message: 'Post created successfully!',
            post: post
        })
    })
    .catch(err => {
        if(!err.statusCode){
            err.statusCode = 500
        }
        next(err)
    }) 

}