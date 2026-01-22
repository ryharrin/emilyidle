Legend: 
x  = Feature implemented
- = Feature planned
* = Do not plan to implement

Completed Features:
x Come up with a different currency for sentimental value, like "memories" or "nostalgia points".
x Add a way to interact with your selected watch beyond just viewing it in the catalog, such as a mini-game
x Implement a feature where certain watches can unlock special abilities or bonuses in the idle game.
x Introduce a storyline or lore that unfolds as players collect more watches, adding depth to the game.
x Have a tabbed interface in the catalog to separate owned watches from unowned ones.
x Have a tabbed interface for the main game to separate different gameplay aspects (e.g., production, upgrades, prestige).
x Add sound effects or background music that can be toggled on/off to enhance the gaming experience
x Add more brands and models to the watch catalog to increase variety and appeal to different tastes.
x Add a statistics dashboard showing detailed metrics about the player's progress, watch collection, and gameplay habits.
x Add achievements or badges for collecting certain sets of watches or reaching specific milestones in the game.
x Add more detailed tooltips or info boxes for watches in the catalog, providing historical context or interesting facts about each model.
x Consider different names for the prestige mechanics that fit the watch theme better, related to collecting watches
x Use real trusted dealer names.
x Add Emily's birthday as an in-game event or milestone. 4/27/89
x Add a way to sort/filter the watch catalog by different criteria (e.g., brand, era, type).
x Add more women's watches to the catalog to appeal to a broader audience.


Will not implement Features:
* Introduce a crafting system where players can combine certain watches or parts to create new, unique
  watches with special attributes.
* Add a feature where players can customize the appearance of their watches with different straps, dials, or engravings.
* Implement a social sharing feature that allows players to showcase their watch collections on social media platforms.
* Add a feature where players can set up virtual watch exhibitions or galleries to display their collections to other players.
* Introduce a mentorship system where experienced players can guide newcomers, offering tips and sharing strategies for collecting watches and progressing in the game.
* Implement a feature where players can create and join watch clubs or communities within the game to discuss their collections, share tips, and participate in group challenges.
* Any multiplayer features.
* Implement augmented reality (AR) features that allow players to view and interact with their watch collections in a real-world environment using their device's camera.
* Add a feature where players can create and share custom watch designs with the community, allowing others to view, rate, and potentially add them to their collections.
* Add a feature where players can trade watches with each other to foster community interaction.
* Implement seasonal events or limited-time challenges that offer exclusive watches or rewards.
* Add a feature where players can set up virtual watch exhibitions or galleries to display their collections to other players.
* Introduce a mentorship system where experienced players can guide newcomers, offering tips and sharing strategies for collecting watches and progressing in the game.
* Implement a feature where players can create and join watch clubs or communities within the game to discuss

Planned Features:
x Have the watch catalog visually mimic a replica watch website for added immersion.
x Integrate the collection of watches into the game's core mechanics, making them more than just collectibles.
x Have the collection of watches impact gameplay, such as providing bonuses or unlocking new features.
x Hide tabs that are not yet relevant to the player to reduce clutter.
x Add a settings menu for customizing gameplay experience.
x Add a setting to toggle between light and dark mode for better accessibility.
x Add a setting to hide completed achievements from the achievements list.
x Add a setting to hide tabs that are no longer relevant to the player.
x Add a tutorial or help section to guide new players through the game's mechanics.
x Add detailed information about each watch, including history, specifications, and significance.
x Add a dev mode for testing purposes, allowing for easy unlocking of watches and resources, as well as modifying the rate of resource generation.
x Improve the mini game mechanics to make them more engaging and rewarding.
x Improve the prestige mechanics to make them more meaningful and integrated into the overall gameplay loop.
x Add more detailed information about the watches, their specs, and historical context.
x Introduce a crafting system where players can combine certain watches or parts to create new, unique watches with special attributes.
x Set up github pages for hosting the game online.
x Deploy the game to github pages for easy access and sharing.


Bug fixes:
x Replace the catalog filter <search> wrapper with a standard form element to avoid invalid tag warnings.
x Skip the requestAnimationFrame simulation loop during Vitest runs to eliminate act() warnings.
- The 'interact' button doesn't seem to do anything yet. (Planned fix: implement mini-game mechanics triggered by the button.)
- Display how much money is needed for the next blueprint in the atelier view. (Planned fix: add a display element showing the cost of the next blueprint.)

Upcoming Major Changes to Game Design:
- Make enjoyment the main currency. Make better watches increase enjoyment rate. Quartz watches give very small enjoyment, mechanical more, and complications even more.
- Money should be earned separately. It is earned by a second parallel mechanic, working as a therapist/psychologist. Start as grad student, then advance through career stages ending at running a private practice. Money is used to buy watches, but they are gated by having enough enjoyment.
- Refactor prestige mechanics to fit new dual-currency model. Prestige resets enjoyment and money, but gives nostalgia points based on total enjoyment earned. Nostalgia points are used to unlock watches permanently.
- Introduce nostalgia points as a new currency earned through prestige, used to unlock watches permanently.
- Refactory prestige mechanics to fit new dual-currency model. Prestige resets enjoyment and money, but gives nostalgia points based on total enjoyment earned. Nostalgia points are used to unlock watches permanently.
- Watches are unlocked permanently via nostalgia points, rather than being re-bought each run.
- Refactor game files for clarity and maintainability. There should be clear separation between core game logic, UI components, and data/models. Files should be organized into appropriate directories and be relatively small and focused.
