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
        return await Referral.findOne({ where: { refereeAddress: refereeAddress.toLowerCase() } });
      },
    });

    t.nonNull.list.field('referrals', {
      type: nonNull('Referral'),
      resolve: async () => {
        return await Referral.find();
      },
    });


    t.field("referrerPoints", {
      type: "Float",
      args: {
        referrerAddress: nonNull(stringArg()),
      },
      resolve: async (_, { referrerAddress }) => {
        return await Referral.findOne({ where: { referrerAddress: referrerAddress.toLowerCase() } });
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
        resolve: (_, { refereeAddress, referrerAddress , dailyPoints, createdAt}) => {
        return Referral.create({ refereeAddress: refereeAddress.toLowerCase() , referrerAddress , dailyPoints, createdAt}).save();
      },
    });

    t.field('updateReferral', {
      type: 'Referral',
      args: {
        refereeAddress: nonNull(stringArg()),
        dailyPoints: floatArg(),
        createdAt: nonNull(stringArg()),
      },
      resolve: async (_, {refereeAddress, dailyPoints, createdAt}) => {
        const referral = await Referral.findOne({ where: { refereeAddress: refereeAddress.toLowerCase() } });
        if (!referral) {
          throw new Error('Referral not found');
        }
        referral.dailyPoints = dailyPoints ?? 0;
        referral.createdAt = createdAt ?? referral.createdAt;
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
        const referral = await Referral.findOne({ where: { refereeAddress: refereeAddress.toLowerCase() } });
        if (!referral) {
          throw new Error('Referral not found');
        }
        referral.dailyPoints = dailyPoints;
        return await referral.save();
      },
    });
  },
})