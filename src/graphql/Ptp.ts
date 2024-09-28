import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus'
import { Ptp } from '../entities'

export const PtpType = objectType({
  name: 'Ptp',
  definition(t) {
    t.nonNull.string('userAddress')
    t.nonNull.float('amount')
  },
})

export const PtpQuery = extendType({
  type: 'Query',
  definition(t) {
    t.nonNull.list.nonNull.field('ptp', {
      type: 'Ptp',
      resolve: () => {
        return Ptp.find();
      },
    })

    t.field('ptp', {
      type: 'Ptp',
      args: {
        userAddress: nonNull(stringArg()),
      },
      resolve: (_, args: Partial<Ptp>) => {
        return Ptp.findOne({ where: { userAddress: args.userAddress } });
      },
    })
  },
})

export const PtpDepositMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createPtp', {
      type: 'Ptp',
      args: {
        amount: nonNull(floatArg()),
        userAddress: nonNull(stringArg()),
      },
      resolve: (_, args: Ptp) => {
        return Ptp.create(args).save();
      },
    })
  },
})
