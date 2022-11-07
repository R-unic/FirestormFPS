import { Controller, OnStart, OnInit } from "@flamework/core";
import { Players } from "@rbxts/services";

@Controller({})
export class CrosshairController implements OnStart, OnInit {
    public onInit(): void {
        Players.LocalPlayer.GetMouse().Icon = "rbxassetid://5992580992"
    }

    public onStart(): void {
        
    }
}