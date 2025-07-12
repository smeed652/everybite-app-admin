import { graphql } from 'msw';
import { makeWidget } from '../__tests__/factories/widget';

export const handlers = [
  // GET_SMART_MENUS query handler
  graphql.query('GetSmartMenus', (_req, res, ctx) => {
    return res(
      ctx.data({
        widgets: [makeWidget()],
      })
    );
  }),
];
