import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Mongoose: MONGODB_URI no está definido en variables de entorno',
  );
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: { conn: any; promise: any } | undefined;
}

let cached: { conn: any; promise: any } = global.mongoose as any;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const dbNameMatch = MONGODB_URI?.match(
      /^mongodb(?:\+srv)?:\/\/.+\/([^?]+)/,
    );
    const dbName = dbNameMatch ? dbNameMatch[1] : undefined;

    const opts = {
      bufferCommands: false,
      family: 4,
      ...(dbName && { dbName }), // Fuerza el nombre de la BD si se extrajo de la URI
    };

    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
