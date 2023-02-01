// import { Employe, Prisma } from '@prisma/client';

// // import { IRepository } from './adapter';

// export interface IPrismaRepository<T extends Prisma.RejectOnNotFound | Prisma.RejectPerOperation | false | undefined> {
//   instance: T;
//   // instance!: Prisma.EmployeDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>;
// }

// // function testando(employe: Prisma.EmployeDelegate<Prisma.RejectOnNotFound | Prisma.RejectPerOperation | undefined>) {
// //   throw new Error('Function not implemented.');
// // }

// export class PrismaRepository implements IPrismaRepository<Prisma.EmployeDelegate<{}>> {
//   instance: Prisma.EmployeDelegate;
// }
