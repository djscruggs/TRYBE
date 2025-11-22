import {
  type RouteConfig,
  index,
  route,
  prefix
} from '@react-router/dev/routes'

export default [
  index('routes/_index.tsx'),
  route('home', 'routes/home.tsx'),
  route('challenges', 'routes/challenges.tsx', [
    route('new', 'routes/challenges.new.tsx'),
    route('all', 'routes/challenges.all.tsx'),
    route('mine', 'routes/challenges.mine.tsx'),
    route(':range', 'routes/challenges.$range.tsx'),
    route('v/:id', 'routes/challenges.v.$id.tsx', [
      route(
        'about/:cohortId?',
        'routes/challenges.v.$id.about.($cohortId).tsx'
      ),
      route('chat/:cohortId?', 'routes/challenges.v.$id.chat.($cohortId).tsx'),
      route(
        'checkins/:cohortId?',
        'routes/challenges.v.$id.checkins.($cohortId).tsx'
      ),
      route(
        'members/:cohortId?',
        'routes/challenges.v.$id.members.($cohortId).tsx'
      ),
      route('program', 'routes/challenges.v.$id.program.tsx')
    ])
  ]),
  route('login', 'routes/login.$.tsx'),
  route('logout', 'routes/logout.tsx'),
  route('signup-cta', 'routes/signup-cta.tsx'),
  route('signup', 'routes/signup.$.tsx'),
  route('profile', 'routes/profile.tsx'),
  route('landing', 'routes/landing.tsx'),
  route('feed', 'routes/feed.tsx'),
  ...prefix('posts', [
    index('routes/posts.tsx'),
    route('new', 'routes/posts_.new.tsx'),
    route(':id', 'routes/posts.$id.tsx')
  ]),
  route('community', 'routes/community.tsx'),
  route('admin', 'routes/admin.tsx'),
  ...prefix('api', [
    route('cron', 'routes/api.cron.ts'),
    route('contact', 'routes/api.contact.ts'),
    route('webhooks', 'routes/api.webhooks.ts'),
    route('threads', 'routes/api.threads.ts'),
    ...prefix('likes', [
      index('routes/api.likes.ts'),
      route(':type/:id/comments', 'routes/api.likes.$type.$id.comments.ts'),
      route(':type/:id', 'routes/api.likes.$type.$id.ts')
    ]),
    ...prefix('comments', [
      index('routes/api.comments.ts'),
      route(':id/replies', 'routes/api.comments.$id.replies.ts'),
      route(':type/:id', 'routes/api.comments.$type.$id.ts')
    ]),
    ...prefix('notes', [
      index('routes/api.notes.ts'),
      route('delete/:id', 'routes/api.notes.delete.$id.ts'),
      route(':id/repost', 'routes/api.notes.$id.repost.ts')
    ]),
    ...prefix('posts', [
      index('routes/api.posts.ts'),
      route('delete/:id', 'routes/api.posts.delete.$id.ts'),
      route('v/:id', 'routes/api.posts.v.$id.ts')
    ]),
    ...prefix('users/:id', [
      index('routes/api.users.$id.ts'),
      route('likes', 'routes/api.users.$id.likes.ts')
    ]),
    ...prefix('clerk', [route(':id', 'routes/api.clerk.$id.ts')]),
    route('categories', 'routes/api.categories.ts'),
    ...prefix('memberchallenges', [
      route(':id', 'routes/api.memberchallenges.$id.ts'),
      route(
        ':challengeId/:userId',
        'routes/api.memberchallenges.$challengeId.$userId.ts'
      )
    ]),
    ...prefix('challenges', [
      index('routes/api.challenges.ts'),
      route(':range', 'routes/api.challenges.$range.ts'),
      route('delete/:id', 'routes/api.challenges.delete.$id.ts'),
      route('join-unjoin/:id', 'routes/api.challenges.join-unjoin.$id.ts'),
      route(
        ':id/checkins/:cohortId',
        'routes/api.challenges.$id.checkins.($cohortId).ts'
      ),
      ...prefix('v/:id', [
        index('routes/api.challenges.v.$id.ts'),
        route('program', 'routes/api.challenges.v.$id.program.ts'),
        route(':userId', 'routes/api.challenges.v.$id.$userId.ts'),
        route('membership', 'routes/api.challenges.v.$id.membership.ts')
      ])
    ]),
    ...prefix('checkins', [
      route(
        ':challengeId/:userId/:cohortId?',
        'routes/api.checkins.$challengeId.($userId).($cohortId).ts'
      ),
      route('delete/:id', 'routes/api.checkins.delete.$id.ts')
    ])
  ]),
  // Catch-all route for unmatched paths (returns 404)
  route('*', 'routes/$.tsx')
] satisfies RouteConfig
