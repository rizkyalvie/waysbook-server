// import model
const { users, profile } = require("../../models");
const { PrismaClient } = require("@prisma/client");

// import prisma client
const prisma = new PrismaClient();

// import joi validation
const Joi = require("joi");
// import bcrypt
const bcrypt = require("bcrypt");
//import jsonwebtoken
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  // our validation schema here
  const schema = Joi.object({
    name: Joi.string().min(4).required(),
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  // do validation and get error object from schema.validate
  const { error } = schema.validate(req.body);

  // if error exist send validation error message
  if (error)
    return res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    });

  try {
    // we generate salt (random value) with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // we hash password from request with salt
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    const newUser = await prisma.user.create({
      data: {
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        status: "customer",
      },
    });

    // await profile.create({
    //   image: 'blank-profile.png',
    //   phone: '',
    //   gender: '',
    //   address: '',
    //   idUser: newUser.id
    // });

    // generate token
    const token = jwt.sign({ id: users.id }, process.env.TOKEN_KEY);

    res.status(200).json({
      status: "success...",
      data: {
        name: newUser.name,
        email: newUser.email,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.login = async (req, res) => {
  // our validation schema here
  const schema = Joi.object({
    email: Joi.string().email().min(6).required(),
    password: Joi.string().min(6).required(),
  });

  // do validation and get error object from schema.validate
  const { error } = schema.validate(req.body);

  // if error exist send validation error message
  if (error)
    return res.status(400).send({
      error: {
        message: error.details[0].message,
      },
    });

  try {
    const userExist = await users.findOne({
      where: {
        email: req.body.email,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });
    // compare password between entered from client and from database
    const isValid = await bcrypt.compare(req.body.password, userExist.password);

    // check if not valid then return response with status 400 (bad request)
    if (!isValid) {
      return res.status(400).send({
        status: "failed",
        message: "credential is invalid",
      });
    }

    // generate token
    const token = jwt.sign({ id: userExist.id }, process.env.TOKEN_KEY);

    res.status(200).send({
      status: "success...",
      data: {
        id: userExist.id,
        name: userExist.name,
        email: userExist.email,
        status: userExist.status,
        token,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      status: "failed",
      message: "Server Error",
    });
  }
};

exports.checkAuth = async (req, res) => {
  try {
    const id = req.user.id;

    const dataUser = await users.findOne({
      where: {
        id,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt", "password"],
      },
    });

    if (!dataUser) {
      return res.status(404).send({
        status: "failed",
      });
    }

    res.send({
      status: "success...",
      user: {
        id: dataUser.id,
        name: dataUser.name,
        email: dataUser.email,
        status: dataUser.status,
      },
    });
    console.log(data);
  } catch (error) {
    console.log(error);
    res.status({
      status: "failed",
      message: "Server Error",
    });
  }
};
