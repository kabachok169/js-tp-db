import serviceService from '../services/serviceService';

class ServiceController {
    async clear(ctx) {
        await serviceService.clear();
        ctx.status = 200;
        ctx.body = {};
    }

    async getInfo(ctx) {
        const result = await serviceService.get();
        ctx.status = 200;
        ctx.body = result;
    }

}

const serviceController = new ServiceController();
export default serviceController;