import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus';
import { Main } from '../entities';

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
    t.float('secondEpochPoints')
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
      resolve: async (_, { userAddress }) => {
        return await Main.findOne({ where: { userAddress: userAddress.toLowerCase() } })
      },
    })

    t.list.field('users', {
      type: 'Main',
      resolve: async () => {
        return await Main.find()
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
        secondEpochPoints: floatArg()
      },
      resolve: async(_, { userAddress, totalPoints, rebPool, holdAUSD, holdXAVAX, traderJoe, pharaoh, pangolin, bonus, referral, referralUsed, createdAt, firstEpochPoints, secondEpochPoints }) => {
        return await Main.create({ userAddress: userAddress.toLowerCase(), totalPoints, rebPool, holdAUSD, holdXAVAX, traderJoe, pharaoh, pangolin, bonus, referral, referralUsed, createdAt, firstEpochPoints, secondEpochPoints }).save();
      },
    });

    t.field('addBonus', {
      type: 'Main',
      args: {
        userAddress: nonNull(stringArg()),
        points: nonNull(floatArg()),
      },
      resolve: async (_, { userAddress, points }) => {
        const main = await Main.findOne({ where: { userAddress: userAddress.toLowerCase() } });
        if (!main) {
          throw new Error('User not found');
        }
        main.bonus += points;
        main.totalPoints += points;
        await main.save();
        return main;
      },
    });

    t.field('addPoints', {
      type: 'Main',
      args: {
        userAddress: nonNull(stringArg()),
        totalPoints: floatArg(),
        rebPool: floatArg(),
        holdAUSD: floatArg(),
        holdXAVAX: floatArg(),
        traderJoe: floatArg(),
        pharaoh: floatArg(),
        pangolin: floatArg()
      },
      resolve: async (_, { userAddress, totalPoints, rebPool, holdAUSD, holdXAVAX,  traderJoe, pharaoh}) => {
        const main = await Main.findOne({ where: { userAddress: userAddress.toLowerCase() } });
        if (!main) {
          throw new Error('User not found');
        }
        
        main.totalPoints += totalPoints;
        main.rebPool += rebPool;
        main.holdAUSD += holdAUSD;
        main.holdXAVAX += holdXAVAX;
        main.traderJoe += traderJoe;
        main.pharaoh += pharaoh;
  

        return await main.save();
      },
    });

    t.field("updateUserPoints", {
      type: "Main",
      args: {
        userAddress: nonNull(stringArg()),
        totalPoints: floatArg(),
        rebPool: floatArg(),
        holdAUSD: floatArg(),
        holdXAVAX: floatArg(),
        traderJoe: floatArg(),
        pharaoh: floatArg()
      },
      resolve: async (_, { userAddress, totalPoints, rebPool, holdAUSD, holdXAVAX, traderJoe, pharaoh }) => {
        const main = await Main.findOne({ where: { userAddress: userAddress.toLowerCase() } });
        if (!main) {
          throw new Error('User not found');
        }
        main.rebPool = rebPool;
        main.holdAUSD = holdAUSD;
        main.holdXAVAX = holdXAVAX;
        main.traderJoe = traderJoe;
        main.pharaoh = pharaoh;
        main.totalPoints = totalPoints;
        return await main.save();
      },
    });
  },
})
