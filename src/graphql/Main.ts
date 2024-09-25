import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus'
import { Main } from '../entities/Main'

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
    t.field('getMain', {
      type: 'Main',
      args: {
        userAddress: nonNull(stringArg()),
      },
      resolve: (_, { userAddress }) => {
        return Main.findOne({ where: { userAddress } })
      },
    })
  },
})

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
      resolve: (_, args) => {
        return Main.create(args as Partial<Main>).save();
      },
    })
  },
})
