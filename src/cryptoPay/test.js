async function checkInvoiceStatus(invoiceId) {
    try {
        const invoices = await cryptoPay.getInvoices({ invoice_ids: invoiceId.toString() });
        if (invoices.length > 0 && invoices[0].status === 'paid') {
            console.log(`Счет ${invoiceId} оплачен на сумму ${invoices[0].amount} ${invoices[0].asset}`);
            // Дополнительная обработка оплаченного счета
        } else {
            console.log(`Счет ${invoiceId} не оплачен`);
        }
    } catch (error) {
        console.error('Ошибка при проверке статуса счета:', error);
    }
}