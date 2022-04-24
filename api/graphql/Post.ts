import { extendType, objectType, stringArg, nonNull, intArg } from 'nexus'

export const Post = objectType({
  name: 'Post',
  definition(t) {
    t.int('id')
    t.string('title')
    t.string('body')
    t.boolean('published')
  }
})

export const PostQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('drafts', {
      type: 'Post',
      resolve(_root, _args, ctx) {
        return ctx.db.post.findMany({
          where: {
            published: false
          }
        })
      }
    }),
    t.list.field('posts', {
      type: 'Post',
      resolve(_root, _args, ctx) {
        return ctx.db.post.findMany({
          where: {
            published: true
          }
        })
      }
    })
  }
})

export const PostMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createDraft', {
      type: 'Post',
      args: {
        title: nonNull(stringArg()),
        body: nonNull(stringArg())
      },
      async resolve(_root, args, ctx) {
        const draft = {
          title: args.title,
          body: args.body,
          published: false
        }

        return await ctx.db.post.create({ data: draft })
      },
    }),
    t.field('publish', {
      type: 'Post',
      args: {
        draftId: nonNull(intArg())
      },
      async resolve(_root, args, ctx) {
        let draftToPublish = ctx.db.post.findUnique({
          where: {
            id: args.draftId
          }
        })

        if (!draftToPublish) {
          throw new Error('draft not found')
        }

        await ctx.db.post.update({
          where: {
            id: args.draftId
          },
          data: {
            published: true
          }
        })

        return draftToPublish
      }
    })
  }
})
