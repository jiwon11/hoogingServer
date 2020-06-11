const express = require('express');
const { Post,Tag,User,Search,Address,Collection } = require('../models');
const { isLoggedIn } = require('./middlewares');
const sequelize = require("sequelize");
const Op = sequelize.Op;

const router = express.Router();

router.get('/', isLoggedIn ,async(req,res,next) => {
    // http://localhost:8001/search?q={word}&category={category}
    console.log(req.query); // { q: 'test', category: 'popular' }
    const query = req.query.q;
    const category = req.query.category;
    const offset = req.query.offset;
    const limit = req.query.limit;
    try{
        if(query === '' || category === ''){
            const recentSearchResults = await Search.findAll({
                where:{
                    deletedAt : null,
                    userId: req.user.id
                },
                order: [['updatedAt', 'DESC']]
            });
            res.status(200).json({
                'message' : 'recentSearchResults',
                'result Category' : 'Recent Search Word',
                'result' : recentSearchResults
            });
        }else{
            if(category !== 'popular'){
                const queries = query.split(',');
                    await Promise.all(queries.map(query => {
                        Search.findOrCreate({
                            where : {
                                deletedAt : null,
                                query : query,
                                category : category,
                                userId : req.user.id
                            }
                        });
                    }
                    ));
                if(category ==='tag'){
                    const queries = query.split(',');
                    console.log(queries);
                    const tagQueryResults = await Promise.all(queries.map(query => 
                        Tag.findAll({
                            where:{
                                deletedAt : null,
                                name: {
                                    [Op.like]: "%" + query + "%"
                                }
                            },
                            order : [
                                ['reviewNum', 'DESC'],
                            ]
                        })
                    ));
                    return res.status(200).json({
                        'message' : 'tagQueryResults',
                        'result Category' : 'Tag',
                        'result' : tagQueryResults
                    });
                }
                if(category ==='user'){
                    const userQueryResults = await User.findAll({
                        where:{
                            nickname: {
                                [Op.like]: "%" + query + "%"
                            }
                        },
                        include : [{
                            model : User,
                            as : 'Followers',
                            attributes : []
                        }, {
                            model : User,
                            as : 'Followings',
                            attributes : []
                        }],
                        attributes : [
                            'id',
                            'nickname',
                            'profileImg',
                            [sequelize.fn('COUNT', sequelize.col('Followers.id')), 'followersNum']
                        ],
                        order : [
                            [sequelize.fn('COUNT', sequelize.col('Followers.id')), 'DESC']
                        ]
                    });
                    res.status(200).json({
                        'message' : 'userQueryResults',
                        'result Category' : 'User',
                        'result' : userQueryResults
                    });
                }
                if(category ==='address'){
                    const adressQueryResults = await Address.findAll({
                        where:{
                            deletedAt : null,
                            address: {
                                [Op.like]: "%" + query + "%"
                            }
                        },
                        order : [
                            ['reviewNum', 'DESC']
                        ]
                    });
                    res.status(200).json({
                        'message' : 'adressQueryResults',
                        'result Category' : 'Address',
                        'result' : adressQueryResults
                    });
                }
            }
            else{ //categoty === 'popular'
                const popularQueryResults = await Search.findAll({
                    where:{
                        deletedAt : null,
                        query: {
                            [Op.like]: "%" + query + "%"
                        }
                    },
                    attributes: ['query','category', [sequelize.fn('COUNT', sequelize.col('query')), 'COUNT']],
                    group : ['search.query'],
                    raw: true,
                    order: sequelize.literal('COUNT DESC')
                });
                res.status(200).json({
                    'message' : 'queryPopularResults',
                    'result Category' : 'Popular',
                    'result' : popularQueryResults
                });
            }
        }
    } catch (error) {
        console.error(error);
        next(error);
    }
});



module.exports = router;