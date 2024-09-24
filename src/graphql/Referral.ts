import { objectType, extendType, nonNull, stringArg, intArg } from 'nexus'
import { Referral } from '../entities/Referral'

export const ReferralType = objectType({
  name: 'Referral',
  definition(t) {
    t.nonNull.string('refereeAddress')
    t.nonNull.string('referralAddress')
    t.nonNull.int('dailyPoints')
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
        referralAddress: nonNull(stringArg()),
        dailyPoints: nonNull(intArg()),
      },
      resolve: (_, { refereeAddress, referralAddress, dailyPoints }) => {
        return Referral.create({
            refereeAddress,
            referralAddress,
            dailyPoints,
          }).save()
      },
    })

    t.nonNull.field('updateReferral', {
      type: 'Referral',
      args: {
        refereeAddress: nonNull(stringArg()),
        dailyPoints: nonNull(intArg()),
      },
      resolve: async (_, { refereeAddress, dailyPoints }) => {
        const referral = await Referral.findOne({ where: { refereeAddress } })
        if (!referral) {
          throw new Error('Referral not found')
        }
        referral.dailyPoints = dailyPoints
        await referral.save()
        return referral
      },
    })
  },
})
