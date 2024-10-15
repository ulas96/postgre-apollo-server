import { objectType, extendType, nonNull, stringArg, floatArg } from 'nexus';
import { Feedback } from '../entities';

export const FeedbackType = objectType({
  name: 'Feedback',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.string('userAddress')
    t.string('q1')
    t.string('q2')
    t.string('q3')
  },
})

export const FeedbackQuery = extendType({
  type: 'Query',
  definition(t) {
    t.list.field('feedback', {
      type: 'Feedback',
      resolve: async () => {
        return await Feedback.find()
      },
    })
  },
}); 


export const FeedbackMutation = extendType({
  type: 'Mutation',
  definition(t) {

    t.field('createFeedback', {
      type: 'Feedback',
      args: {
        userAddress: nonNull(stringArg()),
        q1: floatArg(),
        q2: floatArg(),
        q3: floatArg(),
      },
      resolve: async(_, args: Partial<Feedback>) => {
        return await Feedback.create(args).save();
      },
    });

   
  },
})
