export default function defaultHandler(socket, event, data) {
    console.log(`Unhandled event: ${event}`, data);
    // Logique par défaut pour les événements non gérés
}