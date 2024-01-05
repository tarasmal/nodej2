import process from 'node:process';
function gracefulShutdown(server) {
    console.log('graceful shutdown');
    server.close((error) => {
        if (error) {
            console.error(error);
            process.exit(1);
        }
    });
}

export default gracefulShutdown