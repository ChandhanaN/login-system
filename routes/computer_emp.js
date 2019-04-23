const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const mongoose = require('mongoose');
const Person = require('../models/Computer');
const key = require('../setup/myurl');
const jsonwt = require('jsonwebtoken');
const passport = require('passport');
const config = require('../strategies/jsonstrategy');

router.post('/register', (req, res) =>{
    Person.findOne({email: req.body.email})
        .then(person =>{
            if(person){
                return res.status(400).json({emailerror:'person existed'});
            }else{
                const newPerson = new Person({ 
                    name: req.body.name,
                    email: req.body.email,
                    password: req.body.password
                });
                //encrypt password using bcrypt
                bcrypt.genSalt(10, (err, salt) =>{
                    bcrypt.hash(newPerson.password, salt, (err, hash) =>{
                        if(err) throw err;
                        newPerson.password = hash; //edhi mrng vadu cheppindhi.. passwords anni encry
                        newPerson.save()
                            .then(person => res.json(person))
                            .catch(err => console.log(err));
                    })
                })
            }
        })
        .catch(err => console.log(err));
});

router.post('/login', (req, res) =>{
    const email = req.body.email;
    const password = req.body.password;
 Person.findOne({email})
        .then(person =>{
            if(!person){
                return res.status(404).json({emailerror:'user not found'});
            }
            else{
                bcrypt.compare(password, person.password)
                    .then(isCorrect =>{
                        if(isCorrect){
                            // res.json({success:'login success'});
                            const payload = {
                                id: person.id,
                                email:person.email,
                                name:person.name
                            };
                         var token =  jsonwt.sign(
                               payload,
                               key.secret,
                               {
                                   expiresIn: 3600
                               },
                            //   (err, token) =>{
                            //       res.json({
                            //           success: true,
                            //           token: "Bearer " + token
                            //       });
                                // }
                           );
                        // res.header('x-authorization',"Bearer " + token);
                        // res.redirect('/compemp');
                       res.cookie('authentication', "Bearer " + token);
                       res.redirect('/compemp');

                        }
                        else{
                            res.status(500).json({error:'internal error caused by bcrypt'});
                        }
                    })
                    .catch(err => console.log(err));
            }
        });
});

router.get('/compemp', passport.authenticate("jwt", {session: false}),(req, res) =>{
    let token = req.cookies.authenticate;
    res.send('authorized');

    // res.render('employee');
})


module.exports = router;