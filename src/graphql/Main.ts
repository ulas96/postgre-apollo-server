import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus'
import { Main } from '../entities'

export const MainType = objectType({
  name: 'Main',
  definition(t) {
    t.nonNull.string('userAddress')
    t.float('totalPoints')
    t.float('rebPool')
    t.float('holdAUSD')
    t.float('holdXAVAX')
    t.float('traderJoe')
    t.float('pharaoh')
    t.float('pangolin')
    t.float('bonus')
    t.string('referral')
    t.string('referralUsed')
    t.string('createdAt')
    t.float('firstEpochPoints')
  },
})

export const MainQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('user', {
      type: 'Main',
      args: {
        userAddress: nonNull(stringArg()),
      },
      resolve: (_, { userAddress }) => {
        return Main.findOne({ where: { userAddress } })
      },
    })

    t.list.field('users', {
      type: 'Main',
      resolve: () => {
        return Main.find()
      },
    })


    t.list.nonNull.string('getAllUserAddresses', {
      resolve: async () => {
        const users = await Main.find({ select: ['userAddress'] })
        return users.map(user => user.userAddress)
      },
    })
  },
}); 


export const MainMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('updateMainPoints', {
      type: 'Main',
      args: {
        userAddress: nonNull(stringArg()),
        points: nonNull(floatArg()),
      },
      resolve: async (_, { userAddress, points }) => {
        const main = await Main.findOne({ where: { userAddress } })
        if (!main) {
          throw new Error('User not found')
        }
        main.totalPoints += points
        await main.save()
        return main
      },
    })

    t.field('createMain', {
      type: 'Main',
      args: {
        userAddress: nonNull(stringArg()),
        totalPoints: floatArg(),
        rebPool: floatArg(),
        holdAUSD: floatArg(),
        holdXAVAX: floatArg(),
        traderJoe: floatArg(),
        pharaoh: floatArg(),
        pangolin: floatArg(),
        bonus: floatArg(),
        referral: stringArg(),
        referralUsed: stringArg(),
        createdAt: stringArg(),
        firstEpochPoints: floatArg(),
      },
      resolve: async(_, args) => {
        return await Main.create(args as Main).save();
      },
    })
  },
})
