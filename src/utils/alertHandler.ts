import alertReadModel from "../models/alertRead.js";
import alertsModel from "../models/alerts.js";

    /**
    * Checks if all alerts are read by the user and creates required database entries for alerts. returns true if all alerts are read, false if not.
    */
export async function checkIfAlertsRead(userId: string) {
    let alertRead = await alertReadModel.findOne({ userId });
    let allAlertsRead = true;

    if (alertRead) {
        await alertsModel.find().then((alerts) => {
            alerts.forEach((alert) => {
                const found = alertRead?.alerts?.get(alert._id as unknown as string);
                if (!found) {
                    alertRead!.alerts?.set(alert._id as unknown as string, false);
                    allAlertsRead = false;
                }
            });
        });

        alertRead.alerts?.forEach((read) => {
            if (read === false) {
                allAlertsRead = false;
            }
        });

    } else {
        allAlertsRead = false;
        alertRead = await alertReadModel.create({
            userId,
            alerts: new Map(),
        });
        await alertsModel.find().then((alerts) => {
            alerts.forEach(alert => {
                alertRead!.alerts?.set(alert._id as unknown as string, false);
            });
        });
    }

    if (alertRead) await alertRead.save();
    return allAlertsRead;
}

export async function countUnreadAlerts(userId: string) {
    let unreadAlertsCount = 0;
    let alertRead = await alertReadModel.findOne({ userId });

    alertRead!.alerts?.forEach((read) => {
        if (read === false) {
            unreadAlertsCount++;
        }
    });

    return unreadAlertsCount;
}