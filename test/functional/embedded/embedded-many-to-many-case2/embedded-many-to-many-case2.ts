import "reflect-metadata"
import { Post } from "./entity/Post"
import { Counters } from "./entity/Counters"
import { DataSource } from "../../../../src/data-source/DataSource"
import { expect } from "chai"
import {
    closeTestingConnections,
    createTestingConnections,
    reloadTestingDatabases,
} from "../../../utils/test-utils"
import { Subcounters } from "./entity/Subcounters"
import { User } from "./entity/User"

describe("embedded > embedded-many-to-many-case2", () => {
    let connections: DataSource[]
    before(
        async () =>
            (connections = await createTestingConnections({
                entities: [__dirname + "/entity/*{.js,.ts}"],
            })),
    )
    beforeEach(() => reloadTestingDatabases(connections))
    after(() => closeTestingConnections(connections))

    describe("owner side", () => {
        it("should insert, load, update and remove entities with embeddeds when embedded entity having ManyToMany relation", () =>
            Promise.all(
                connections.map(async (connection) => {
                    const post1 = new Post()
                    post1.id = 1
                    post1.title = "About cars"
                    post1.counters = new Counters()
                    post1.counters.code = 1
                    post1.counters.comments = 1
                    post1.counters.favorites = 2
                    post1.counters.likes = 3
                    post1.counters.subcounters = new Subcounters()
                    post1.counters.subcounters.version = 1
                    post1.counters.subcounters.watches = 5
                    await connection.getRepository(Post).save(post1)

                    const post2 = new Post()
                    post2.id = 2
                    post2.title = "About airplanes"
                    post2.counters = new Counters()
                    post2.counters.code = 2
                    post2.counters.comments = 2
                    post2.counters.favorites = 3
                    post2.counters.likes = 4
                    post2.counters.subcounters = new Subcounters()
                    post2.counters.subcounters.version = 1
                    post2.counters.subcounters.watches = 10
                    await connection.getRepository(Post).save(post2)

                    const user1 = new User()
                    user1.id = 1
                    user1.name = "Alice"
                    user1.likedPosts = [post1, post2]
                    await connection.getRepository(User).save(user1)

                    const user2 = new User()
                    user2.id = 2
                    user2.name = "Bob"
                    user2.likedPosts = [post1]
                    await connection.getRepository(User).save(user2)

                    const user3 = new User()
                    user3.id = 3
                    user3.name = "Clara"
                    user3.likedPosts = [post2]
                    await connection.getRepository(User).save(user3)

                    const loadedUsers = await connection.manager
                        .createQueryBuilder(User, "user")
                        .leftJoinAndSelect("user.likedPosts", "likedPost")
                        .orderBy("user.id")
                        .addOrderBy("likedPost.id")
                        .getMany()

                    expect(
                        loadedUsers[0].should.be.eql({
                            id: 1,
                            name: "Alice",
                            likedPosts: [
                                {
                                    id: 1,
                                    title: "About cars",
                                    counters: {
                                        code: 1,
                                        comments: 1,
                                        favorites: 2,
                                        likes: 3,
                                        subcounters: {
                                            version: 1,
                                            watches: 5,
                                        },
                                    },
                                },
                                {
                                    id: 2,
                                    title: "About airplanes",
                                    counters: {
                                        code: 2,
                                        comments: 2,
                                        favorites: 3,
                                        likes: 4,
                                        subcounters: {
                                            version: 1,
                                            watches: 10,
                                        },
                                    },
                                },
                            ],
                        }),
                    )
                    expect(
                        loadedUsers[1].should.be.eql({
                            id: 2,
                            name: "Bob",
                            likedPosts: [
                                {
                                    id: 1,
                                    title: "About cars",
                                    counters: {
                                        code: 1,
                                        comments: 1,
                                        favorites: 2,
                                        likes: 3,
                                        subcounters: {
                                            version: 1,
                                            watches: 5,
                                        },
                                    },
                                },
                            ],
                        }),
                    )
                    expect(
                        loadedUsers[2].should.be.eql({
                            id: 3,
                            name: "Clara",
                            likedPosts: [
                                {
                                    id: 2,
                                    title: "About airplanes",
                                    counters: {
                                        code: 2,
                                        comments: 2,
                                        favorites: 3,
                                        likes: 4,
                                        subcounters: {
                                            version: 1,
                                            watches: 10,
                                        },
                                    },
                                },
                            ],
                        }),
                    )

                    const loadedUser = await connection.manager
                        .createQueryBuilder(User, "user")
                        .leftJoinAndSelect("user.likedPosts", "likedPost")
                        .orderBy("likedPost.id")
                        .where("user.id = :id", { id: 1 })
                        .getOne()

                    expect(
                        loadedUser!.should.be.eql({
                            id: 1,
                            name: "Alice",
                            likedPosts: [
                                {
                                    id: 1,
                                    title: "About cars",
                                    counters: {
                                        code: 1,
                                        comments: 1,
                                        favorites: 2,
                                        likes: 3,
                                        subcounters: {
                                            version: 1,
                                            watches: 5,
                                        },
                                    },
                                },
                                {
                                    id: 2,
                                    title: "About airplanes",
                                    counters: {
                                        code: 2,
                                        comments: 2,
                                        favorites: 3,
                                        likes: 4,
                                        subcounters: {
                                            version: 1,
                                            watches: 10,
                                        },
                                    },
                                },
                            ],
                        }),
                    )

                    loadedUser!.name = "Anna"
                    loadedUser!.likedPosts = [post1]
                    await connection.getRepository(User).save(loadedUser!)

                    const loadedUser2 = await connection.manager
                        .createQueryBuilder(User, "user")
                        .leftJoinAndSelect("user.likedPosts", "likedPost")
                        .orderBy("likedPost.id")
                        .where("user.id = :id", { id: 1 })
                        .getOne()

                    expect(
                        loadedUser2!.should.be.eql({
                            id: 1,
                            name: "Anna",
                            likedPosts: [
                                {
                                    id: 1,
                                    title: "About cars",
                                    counters: {
                                        code: 1,
                                        comments: 1,
                                        favorites: 2,
                                        likes: 3,
                                        subcounters: {
                                            version: 1,
                                            watches: 5,
                                        },
                                    },
                                },
                            ],
                        }),
                    )

                    await connection.getRepository(User).remove(loadedUser2!)

                    const loadedUsers2 = (await connection
                        .getRepository(User)
                        .find())!
                    expect(loadedUsers2.length).to.be.equal(2)
                    expect(loadedUsers2[0].name).to.be.equal("Bob")
                    expect(loadedUsers2[1].name).to.be.equal("Clara")
                }),
            ))
    })

    describe("inverse side", () => {
        it("should insert, load, update and remove entities with embeddeds when embedded entity having ManyToMany relation", () =>
            Promise.all(
                connections.map(async (connection) => {
                    const user1 = new User()
                    user1.id = 1
                    user1.name = "Alice"
                    await connection.getRepository(User).save(user1)

                    const user2 = new User()
                    user2.id = 2
                    user2.name = "Bob"
                    await connection.getRepository(User).save(user2)

                    const user3 = new User()
                    user3.id = 3
                    user3.name = "Clara"
                    await connection.getRepository(User).save(user3)

                    const postRepository = connection.getRepository(Post)

                    const post1 = new Post()
                    post1.id = 1
                    post1.title = "About cars"
                    post1.counters = new Counters()
                    post1.counters.code = 1
                    post1.counters.comments = 1
                    post1.counters.favorites = 2
                    post1.counters.likes = 3
                    post1.counters.likedUsers = [user1, user2]
                    post1.counters.subcounters = new Subcounters()
                    post1.counters.subcounters.version = 1
                    post1.counters.subcounters.watches = 5
                    await postRepository.save(post1)

                    const post2 = new Post()
                    post2.id = 2
                    post2.title = "About airplanes"
                    post2.counters = new Counters()
                    post2.counters.code = 2
                    post2.counters.comments = 2
                    post2.counters.favorites = 3
                    post2.counters.likes = 4
                    post2.counters.likedUsers = [user3]
                    post2.counters.subcounters = new Subcounters()
                    post2.counters.subcounters.version = 1
                    post2.counters.subcounters.watches = 10
                    await postRepository.save(post2)

                    const loadedPosts = await connection.manager
                        .createQueryBuilder(Post, "post")
                        .leftJoinAndSelect(
                            "post.counters.likedUsers",
                            "likedUser",
                        )
                        .orderBy("post.id")
                        .addOrderBy("likedUser.id")
                        .getMany()

                    expect(
                        loadedPosts[0].should.be.eql({
                            id: 1,
                            title: "About cars",
                            counters: {
                                code: 1,
                                comments: 1,
                                favorites: 2,
                                likes: 3,
                                likedUsers: [
                                    {
                                        id: 1,
                                        name: "Alice",
                                    },
                                    {
                                        id: 2,
                                        name: "Bob",
                                    },
                                ],
                                subcounters: {
                                    version: 1,
                                    watches: 5,
                                },
                            },
                        }),
                    )
                    expect(
                        loadedPosts[1].should.be.eql({
                            id: 2,
                            title: "About airplanes",
                            counters: {
                                code: 2,
                                comments: 2,
                                favorites: 3,
                                likes: 4,
                                likedUsers: [
                                    {
                                        id: 3,
                                        name: "Clara",
                                    },
                                ],
                                subcounters: {
                                    version: 1,
                                    watches: 10,
                                },
                            },
                        }),
                    )

                    const loadedPost = await connection.manager
                        .createQueryBuilder(Post, "post")
                        .leftJoinAndSelect(
                            "post.counters.likedUsers",
                            "likedUser",
                        )
                        .orderBy("likedUser.id")
                        .where("post.id = :id", { id: 1 })
                        .getOne()

                    expect(
                        loadedPost!.should.be.eql({
                            id: 1,
                            title: "About cars",
                            counters: {
                                code: 1,
                                comments: 1,
                                favorites: 2,
                                likes: 3,
                                likedUsers: [
                                    {
                                        id: 1,
                                        name: "Alice",
                                    },
                                    {
                                        id: 2,
                                        name: "Bob",
                                    },
                                ],
                                subcounters: {
                                    version: 1,
                                    watches: 5,
                                },
                            },
                        }),
                    )

                    loadedPost!.counters.favorites += 1
                    loadedPost!.counters.subcounters.watches += 1
                    loadedPost!.counters.likedUsers = [user1]
                    await postRepository.save(loadedPost!)

                    const loadedPost2 = await connection.manager
                        .createQueryBuilder(Post, "post")
                        .leftJoinAndSelect(
                            "post.counters.likedUsers",
                            "likedUser",
                        )
                        .orderBy("likedUser.id")
                        .where("post.id = :id", { id: 1 })
                        .getOne()

                    expect(
                        loadedPost2!.should.be.eql({
                            id: 1,
                            title: "About cars",
                            counters: {
                                code: 1,
                                comments: 1,
                                favorites: 3,
                                likes: 3,
                                likedUsers: [
                                    {
                                        id: 1,
                                        name: "Alice",
                                    },
                                ],
                                subcounters: {
                                    version: 1,
                                    watches: 6,
                                },
                            },
                        }),
                    )

                    await postRepository.remove(loadedPost2!)

                    const loadedPosts2 = (await postRepository.find())!
                    expect(loadedPosts2.length).to.be.equal(1)
                    expect(loadedPosts2[0].title).to.be.equal("About airplanes")
                }),
            ))
    })
})
