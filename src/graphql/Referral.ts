import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus'
import { Referral } from '../entities'

export const ReferralType = objectType({
  name: 'Referral',
  definition(t) {
    t.nonNull.string('refereeAddress')
    t.nonNull.string('referrerAddress')
    t.float('dailyPoints')
    t.nonNull.string('createdAt')
  },
});

export const RefereesType = objectType({
  name: 'Referees',
  definition(t) {
    t.nonNull.list.nonNull.string('referees')
  },
});

export const DailyPointsType = objectType({
  name: 'DailyPoints',
  definition(t) {
    t.nonNull.string('refereeAddress')
    t.nonNull.float('dailyPoints')
  },
});

export const ReferralQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('referral', {
      type: 'Referral',
      args: { 
        refereeAddress: nonNull(stringArg()),
      },
      resolve: async (_, { refereeAddress }) => {
        return await Referral.findOne({ where: { refereeAddress } });
      },
    });

    t.field('referrals', {
      type: 'Referral',
      resolve: () => {
        return Referral.find();
      },
    });

    t.field('referees', {
      type: 'Referees',
      resolve: async () => {
        return (await Referral.find({ select: ['refereeAddress'] })).map(referral => referral.refereeAddress);
      },
    });


  t.field("referrerPoints", {
    type: "Float",
    args: {
      referrerAddress: nonNull(stringArg()),
    },
    resolve: async (_, { referrerAddress }) => {
      return await Referral.findOne({ where: { referrerAddress } });
    },
  })
  },
})

export const ReferralMutation = extendType({
  type: 'Mutation',
  definition(t) {
    t.field('createReferral', {
      type: 'Referral',
      args: {
        refereeAddress: nonNull(stringArg()),
        referrerAddress: nonNull(stringArg()),
        dailyPoints: floatArg(),
        createdAt: nonNull(stringArg()),
        },
        resolve: (_, args: Referral) => {
        return Referral.create(args).save();
      },
    });

    t.field('updateReferral', {
      type: 'Referral',
      args: {
        refereeAddress: nonNull(stringArg()),
        dailyPoints: floatArg(),
        createdAt: nonNull(stringArg()),
      },
      resolve: async (_, args: Partial<Referral>) => {
        const referral = await Referral.findOne({ where: { refereeAddress: args.refereeAddress } });
        if (!referral) {
          throw new Error('Referral not found');
        }
        referral.dailyPoints = args.dailyPoints ?? 0;
        referral.createdAt = args.createdAt ?? new Date("");
        return await referral.save();
      },
    });

    t.field('updateDailyPoints', {
      type: 'Referral',
      args: {
        refereeAddress: nonNull(stringArg()),
        dailyPoints: nonNull(floatArg()),
      },
      resolve: async (_, { refereeAddress, dailyPoints }) => {
        const referral = await Referral.findOne({ where: { refereeAddress } });
        if (!referral) {
          throw new Error('Referral not found');
        }
        referral.dailyPoints = dailyPoints;
        return await referral.save();
      },
    });
  },
})