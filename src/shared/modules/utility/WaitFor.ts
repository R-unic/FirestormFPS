export function WaitFor<T extends Instance>(instance: Instance, instanceName: string): T {
    if (!instance) throw error("Instance is undefined");
    if (!instanceName) throw error("Instance name is undefined");
    return instance.WaitForChild(instanceName) as T;
}