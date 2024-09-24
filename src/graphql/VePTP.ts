import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus'
import { VePTP } from '../entities/VePTP'

export const VePtpDepositType = objectType({
  name: 'VePtpDeposit',
  definition(t) {
    t.nonNull.string('userAddress')
    t.nonNull.float('amount')
  },
})

export const VePtpQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('vePtpDeposits', {
      type: 'VePtpDeposit',
      resolve: async () => {
        return await VePTP.find()
      },
    })

    t.field('vePtpDeposit', {
      type: 'VePtpDeposit',
      args: {
        userAddress: nonNull(stringArg()),
      },
      resolve: async (_, { userAddress }) => {
        return await VePTP.findOne({ where: { userAddress } })
      },
    })
  },
})

export const VePtpMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createVePtpDeposit', {
      type: 'VePtpDeposit',
      args: {
        amount: nonNull(floatArg()),
        userAddress: nonNull(stringArg()),
      },
      resolve: (_, { amount, userAddress }) => {
        return VePTP.create({
          amount,
          userAddress,
        }).save()
      },
    })
  },
})
