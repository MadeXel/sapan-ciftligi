package com.madexel.sapanciftligi;

import android.content.Intent;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.google.android.gms.games.GamesSignInClient;
import com.google.android.gms.games.PlayGames;
import com.google.android.gms.games.PlayGamesSdk;

/**
 * Minimal Google Play Games Services v2 bridge: sign-in, leaderboards, achievements.
 * Same JS API as the iOS Game Center plugin ("GameServices").
 * Stays disabled until a real Play Games project id is set in res/values/strings.xml.
 */
@CapacitorPlugin(name = "GameServices")
public class GameServicesPlugin extends Plugin {
    private static final int RC_UI = 9004;
    private boolean enabled = false;

    @Override
    public void load() {
        String appId = getContext().getString(R.string.game_services_project_id);
        enabled = appId != null && appId.matches("\\d{6,}") && !appId.matches("0+");
        if (enabled) PlayGamesSdk.initialize(getContext());
    }

    private boolean guard(PluginCall call) {
        if (enabled) return true;
        JSObject r = new JSObject();
        r.put("signedIn", false);
        r.put("ok", false);
        r.put("error", "Play Games yapılandırılmadı");
        call.resolve(r);
        return false;
    }

    @PluginMethod
    public void signIn(PluginCall call) {
        if (!guard(call)) return;
        GamesSignInClient client = PlayGames.getGamesSignInClient(getActivity());
        client.isAuthenticated().addOnCompleteListener(task -> {
            boolean ok = task.isSuccessful() && task.getResult().isAuthenticated();
            if (ok) { resolvePlayer(call); return; }
            client.signIn().addOnCompleteListener(t2 -> {
                if (t2.isSuccessful() && t2.getResult().isAuthenticated()) { resolvePlayer(call); return; }
                JSObject r = new JSObject();
                r.put("signedIn", false);
                call.resolve(r);
            });
        });
    }

    private void resolvePlayer(PluginCall call) {
        PlayGames.getPlayersClient(getActivity()).getCurrentPlayer().addOnCompleteListener(t -> {
            JSObject r = new JSObject();
            r.put("signedIn", true);
            if (t.isSuccessful() && t.getResult() != null) r.put("name", t.getResult().getDisplayName());
            call.resolve(r);
        });
    }

    @PluginMethod
    public void submitScore(PluginCall call) {
        if (!guard(call)) return;
        String id = call.getString("leaderboardId");
        Integer score = call.getInt("score");
        if (id == null || id.isEmpty() || score == null) { call.reject("leaderboardId ve score gerekli"); return; }
        PlayGames.getLeaderboardsClient(getActivity()).submitScore(id, score);
        JSObject r = new JSObject();
        r.put("ok", true);
        call.resolve(r);
    }

    @PluginMethod
    public void unlockAchievement(PluginCall call) {
        if (!guard(call)) return;
        String id = call.getString("achievementId");
        if (id == null || id.isEmpty()) { call.reject("achievementId gerekli"); return; }
        PlayGames.getAchievementsClient(getActivity()).unlock(id);
        JSObject r = new JSObject();
        r.put("ok", true);
        call.resolve(r);
    }

    @PluginMethod
    public void showLeaderboard(PluginCall call) {
        if (!guard(call)) return;
        String id = call.getString("leaderboardId");
        (id == null || id.isEmpty()
            ? PlayGames.getLeaderboardsClient(getActivity()).getAllLeaderboardsIntent()
            : PlayGames.getLeaderboardsClient(getActivity()).getLeaderboardIntent(id))
            .addOnSuccessListener(i -> { open(i); call.resolve(); })
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    @PluginMethod
    public void showAchievements(PluginCall call) {
        if (!guard(call)) return;
        PlayGames.getAchievementsClient(getActivity()).getAchievementsIntent()
            .addOnSuccessListener(i -> { open(i); call.resolve(); })
            .addOnFailureListener(e -> call.reject(e.getMessage()));
    }

    private void open(Intent intent) {
        getActivity().startActivityForResult(intent, RC_UI);
    }
}
