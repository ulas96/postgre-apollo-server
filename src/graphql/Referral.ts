import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus'
import { Referral } from '../entities/Referral'

export const ReferralType = objectType({
  name: 'Referral',
  definition(t) {
    t.nonNull.string('refereeAddress')
    t.nonNull.string('referrerAddress')
    t.float('dailyPoints')
    t.nonNull.string('createdAt')
  },
})

export const ReferralQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('referrals', {
      type: 'Referral',
      resolve: async () => {
        return await Referral.find()
      },
    })
  },
})

export const ReferralMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createReferral', {
      type: 'Referral',
      args: {
        refereeAddress: nonNull(stringArg()),
        referrerAddress: nonNull(stringArg()),
        dailyPoints: floatArg(),
        createdAt: nonNull(stringArg()),
      },
      resolve: (_, { refereeAddress, referrerAddress, dailyPoints, createdAt }) => {
        return Referral.create({
            refereeAddress,
            referrerAddress,
            dailyPoints,
            createdAt
          }).save();
      },
    })

    t.nonNull.field('updateReferral', {
      type: 'Referral',
      args: {
        refereeAddress: nonNull(stringArg()),
        dailyPoints: floatArg(),
        createdAt: nonNull(stringArg()),
      },
      resolve: async (_, { refereeAddress, dailyPoints, createdAt }) => {
        const referral = await Referral.findOne({ where: { refereeAddress } });
        if (!referral) {
          throw new Error('Referral not found');
        }
        referral.dailyPoints = dailyPoints;
        referral.createdAt = createdAt;
        await referral.save();
        return referral;
      },
    })
  },
})
