import tornado

from jupyter_server.base.handlers import APIHandler

class VoilaStopHandler(APIHandler):
    @tornado.web.authenticated
    async def post(self, kernel_id):
        await self.kernel_manager.shutdown_kernel(kernel_id)
        self.set_status(204)
        self.finish()
