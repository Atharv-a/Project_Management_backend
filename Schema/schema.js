const { model, Schema } = require('mongoose')
const Client = require('../Models/client')
const Project = require('../Models/project')
const { 
    GraphQLObjectType, 
    GraphQLID, 
    GraphQLString, 
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull,
    GraphQLEnumType
} = require('graphql')
const client = require('../Models/client')
const project = require('../Models/project')

const ProjectType = new GraphQLObjectType({
    name:'Project',
    fields:()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        description: {type: GraphQLString},
        status: {type: GraphQLString},
        client:{
            type: ClientType,
            resolve(parent, args){
                return Client.findById(parent.clientId)
            }
        }
    })
});

const ClientType = new GraphQLObjectType({
    name:'Client',
    fields:()=>({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        email: {type: GraphQLString},
        phone: {type: GraphQLString}
    })
});


const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        projects:{
            type: new GraphQLList(ProjectType),
            resolve(parent,args){
                return Project.find()
            }
        },
        project:{
            type: ProjectType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Project.findById(args.id)
            }
        },
        clients:{
            type: new GraphQLList(ClientType),
            resolve(parent,args){
                return Client.find()
            }
        },
        client:{
            type: ClientType,
            args: {id: {type: GraphQLID}},
            resolve(parent, args){
                return Client.findById(args.id)
            }
        }
    }
})

const mutation = new GraphQLObjectType({
    name:'Mutation',
    fields:{
        addClient:{
            type: ClientType,
            args: {
                name: {type: GraphQLNonNull(GraphQLString)},
                email: {type: GraphQLNonNull(GraphQLString)},
                phone: {type: GraphQLNonNull(GraphQLString)}
            },
            resolve(parent,args){
                const newClient = new Client({
                    name: args.name,
                    email: args.email,
                    phone: args.phone,
                })

                return newClient.save();
            }
        },
        deleteClient:{
            type: ClientType,
            args:{
                id: {type: GraphQLNonNull(GraphQLID)},
            },
            async resolve(parent,args){
                const projects = await project.find({clientId: args.id});
                await Promise.all(projects.map(async(project)=>{
                    await Project.findByIdAndDelete(project._id)
                }))
                return Client.findByIdAndDelete(args.id)
            }
        },
        addProject:{
          type: ProjectType,
          args:{
            name: {type: GraphQLNonNull(GraphQLString)},
            description: {type: GraphQLNonNull(GraphQLString)},
            status: {
                type: new GraphQLEnumType({
                    name: 'ProjectStatus',
                    values:{
                        'new': {value: 'Not Started'},
                        'progress': {value: 'In progress'},
                        'completed': {value: 'Completed'}
                    }
                }),
                defaultValue: 'Not Started',
            },
            clientId: {type: GraphQLNonNull(GraphQLID)},
          },
          resolve(parent, args){
                const newProject = new Project({
                    name: args.name,
                    description: args.description,
                    status: args.status,
                    clientId: args.clientId
                })

                return newProject.save()
          }
        },
        deleteProject:{
            type: ProjectType,
            args: {
                id: {type: GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args){
                return Project.findByIdAndDelete(args.id)
            }
        },
        updateProject:{
            type: ProjectType,
            args:{
                id:{ type: GraphQLNonNull(GraphQLID)},
                name: { type: GraphQLString},
                description: { type: GraphQLString},
                status: {
                    type: new GraphQLEnumType({
                        name: 'ProjectStatusUpdate',
                        values:{
                            'new': {value: 'Not Started'},
                            'progress': {value: 'In progress'},
                            'completed': {value: 'Completed'}
                        }
                    }),
                },
            },
            resolve(parent,args){
                return Project.findByIdAndUpdate(
                    args.id,
                    {
                        $set:{
                            name: args.name,
                            description: args.description,
                            status: args.status,
                        }
                    },
                    { new: true}
                )
            }
        }
    }
})

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation
})