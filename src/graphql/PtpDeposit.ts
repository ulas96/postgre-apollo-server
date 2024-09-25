import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus'
import { PtpDeposit } from '../entities/Ptp'

export const PtpDepositType = objectType({
  name: 'PtpDeposit',
  definition(t) {
    t.nonNull.string('userAddress')
    t.nonNull.float('amount')
  },
})

export const PtpDepositQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('ptpDeposits', {
      type: 'PtpDeposit',
      resolve: () => {
        return PtpDeposit.find();
      },
    })

    t.field('ptpDeposit', {
      type: 'PtpDeposit',
      args: {
        userAddress: nonNull(stringArg()),
      },
      resolve: (_, { userAddress }) => {
        return PtpDeposit.findOne({ where: { userAddress } });
      },
    })
  },
})

export const PtpDepositMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createPtpDeposit', {
      type: 'PtpDeposit',
      args: {
        amount: nonNull(floatArg()),
        userAddress: nonNull(stringArg()),
      },
      resolve: (_, { amount, userAddress }) => {
        return PtpDeposit.create({
          amount,
          userAddress,
        }).save();
      },
    })
  },
})
