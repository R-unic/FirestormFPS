import { Controller, OnRender } from "@flamework/core";
import Spring from "shared/modules/utility/Spring";

@Controller({})
export class RecoilController implements OnRender {
	private readonly attached: (Camera | BasePart)[] = [];
    private readonly mainSpringDefaults = [25, 75, 4, 5.5];
    private readonly torqueSpringDefaults = [10, 110, 4, 8];
    private readonly mainSpring = new Spring(...this.mainSpringDefaults);
    private readonly torqueSpring = new Spring(...this.torqueSpringDefaults);
    private readonly modifiers = {
        recoverSpeed: 1,
        kickSpeed: 1,
        kickMultiplier: 1.15,
        kickDamper: 1,
    };

	public onRender(dt: number) {
        const of = this.mainSpring.update(dt).div(80).mul(dt).mul(60);
        const tf = this.torqueSpring.update(dt).div(80).mul(dt).mul(60);
        const offset = new CFrame(0, 0, of.Z * 2.5);
        const vertClimb = CFrame.Angles(of.X, 0, 0);
        const torque = CFrame.Angles(0, tf.Y, tf.Y * 14)
        const recoil = offset.mul(vertClimb).mul(torque);
        
        for (const obj of this.attached)
            obj.CFrame = obj.CFrame.mul(recoil);
    }

    kick(force: Vector3): void {
        const [mainDefaultMass, mainDefaultForce, mainDefaultDamper, mainDefaultSpeed] = this.mainSpringDefaults;
        this.mainSpring.mass = mainDefaultMass / this.modifiers.recoverSpeed;
        this.mainSpring.force = mainDefaultForce * this.modifiers.kickMultiplier;
        this.mainSpring.damping = mainDefaultDamper * this.modifiers.kickDamper;
        this.mainSpring.speed = mainDefaultSpeed * this.modifiers.kickSpeed;
        this.mainSpring.shove(force);

        const [torqueDefaultMass, torqueDefaultForce, torqueDefaultDamper, torqueDefaultSpeed] = this.torqueSpringDefaults;
        this.torqueSpring.mass = torqueDefaultMass / this.modifiers.recoverSpeed;
        this.torqueSpring.force = torqueDefaultForce * this.modifiers.kickMultiplier;
        this.torqueSpring.damping = torqueDefaultDamper * this.modifiers.kickDamper;
        this.torqueSpring.speed = torqueDefaultSpeed * this.modifiers.kickSpeed;
        this.torqueSpring.shove(force);
    }

    attach(instance: Camera | BasePart): void {
        this.attached.push(instance);
    }

    detach(instance: Camera | BasePart): void {
        this.attached.remove(this.attached.indexOf(instance));
    }
}
