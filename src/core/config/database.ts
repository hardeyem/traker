import {registerAs} from '@nestjs/config';

export default registerAs('database', () => ({
    dbUrl: `mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority&authSource=admin`
}));
