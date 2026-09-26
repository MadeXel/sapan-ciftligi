import UIKit
import Capacitor
import GameKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = GameBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

/// Registers the app's local plugins with the Capacitor bridge.
class GameBridgeViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(GameServicesPlugin())
    }
}

/// Minimal Game Center bridge: sign-in, leaderboards, achievements.
/// JS name "GameServices" — the Android side exposes the same methods for Google Play Games.
@objc(GameServicesPlugin)
public class GameServicesPlugin: CAPPlugin, CAPBridgedPlugin, GKGameCenterControllerDelegate {
    public let identifier = "GameServicesPlugin"
    public let jsName = "GameServices"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "signIn", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "submitScore", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "unlockAchievement", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showLeaderboard", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "showAchievements", returnType: CAPPluginReturnPromise)
    ]

    @objc func signIn(_ call: CAPPluginCall) {
        let player = GKLocalPlayer.local
        if player.isAuthenticated {
            call.resolve(["signedIn": true, "name": player.displayName])
            return
        }
        var answered = false
        DispatchQueue.main.async {
            // Game Center may call this handler several times (login sheet, then result).
            player.authenticateHandler = { [weak self] viewController, error in
                if let vc = viewController {
                    self?.bridge?.viewController?.present(vc, animated: true)
                    return
                }
                if answered { return }
                answered = true
                if player.isAuthenticated {
                    call.resolve(["signedIn": true, "name": player.displayName])
                } else {
                    call.resolve(["signedIn": false, "error": error?.localizedDescription ?? ""])
                }
            }
        }
    }

    @objc func submitScore(_ call: CAPPluginCall) {
        guard let id = call.getString("leaderboardId"), let score = call.getInt("score") else {
            call.reject("leaderboardId ve score gerekli"); return
        }
        guard GKLocalPlayer.local.isAuthenticated else { call.resolve(["ok": false]); return }
        GKLeaderboard.submitScore(score, context: 0, player: GKLocalPlayer.local, leaderboardIDs: [id]) { error in
            if let error = error { call.reject(error.localizedDescription) } else { call.resolve(["ok": true]) }
        }
    }

    @objc func unlockAchievement(_ call: CAPPluginCall) {
        guard let id = call.getString("achievementId") else { call.reject("achievementId gerekli"); return }
        guard GKLocalPlayer.local.isAuthenticated else { call.resolve(["ok": false]); return }
        let achievement = GKAchievement(identifier: id)
        achievement.percentComplete = 100
        achievement.showsCompletionBanner = true
        GKAchievement.report([achievement]) { error in
            if let error = error { call.reject(error.localizedDescription) } else { call.resolve(["ok": true]) }
        }
    }

    @objc func showLeaderboard(_ call: CAPPluginCall) {
        let id = call.getString("leaderboardId")
        DispatchQueue.main.async {
            let vc: GKGameCenterViewController
            if let id = id {
                vc = GKGameCenterViewController(leaderboardID: id, playerScope: .global, timeScope: .allTime)
            } else {
                vc = GKGameCenterViewController(state: .leaderboards)
            }
            vc.gameCenterDelegate = self
            self.bridge?.viewController?.present(vc, animated: true)
            call.resolve()
        }
    }

    @objc func showAchievements(_ call: CAPPluginCall) {
        DispatchQueue.main.async {
            let vc = GKGameCenterViewController(state: .achievements)
            vc.gameCenterDelegate = self
            self.bridge?.viewController?.present(vc, animated: true)
            call.resolve()
        }
    }

    public func gameCenterViewControllerDidFinish(_ gameCenterViewController: GKGameCenterViewController) {
        gameCenterViewController.dismiss(animated: true)
    }
}
