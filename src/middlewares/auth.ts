const jwt = require('jsonwebtoken')
import { Response, NextFunction } from "express"
import { user } from "shared/commonInterfaces"

const auth = (req:any, res:Response, next:NextFunction) =>{
    try {
        const token = req.header("Authorization")
        if(!token) return res.status(400).json({msg: "Invalid Authentication"})

        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err:any, user:user) =>{
            if(err) return res.status(400).json({msg: "Invalid Authentication"})

            req.user = user
            next()
        })
    } catch (error) {
        res.status(500).json({ status: 'Failure', message: error || "Something Went Wrong!" });

    }
}

export default auth;