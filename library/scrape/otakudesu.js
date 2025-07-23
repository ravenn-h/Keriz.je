const axios = require('axios');
const cheerio = require('cheerio');

const otakuDesu = {
	// Récupère les animes en cours
	enCours: async () => {
		try {
			const { data } = await axios.get('https://otakudesu.cloud/');
			const $ = cheerio.load(data);
			const resultats = [];
			$('.venz ul li').each((index, element) => {
				const episode = $(element).find('.epz').text().trim();
				const type = $(element).find('.epztipe').text().trim();
				const date = $(element).find('.newnime').text().trim();
				const titre = $(element).find('.jdlflm').text().trim();
				const lien = $(element).find('a').attr('href');
				const image = $(element).find('img').attr('src');
				resultats.push({
					episode,
					type,
					date,
					titre,
					lien,
					image
				});
			});
			return resultats;
		} catch (erreur) {
			console.error('Erreur lors de la récupération des données:', erreur);
		}
	},
	
	// Recherche d'animes par mot-clé
	rechercher: async (requete) => {
		const url = `https://otakudesu.cloud/?s=${requete}&post_type=anime`;
		try {
			const { data } = await axios.get(url);
			const $ = cheerio.load(data);
			const listeAnimes = [];
			$('.chivsrc li').each((index, element) => {
				const titre = $(element).find('h2 a').text().trim();
				const lien = $(element).find('h2 a').attr('href');
				const urlImage = $(element).find('img').attr('src');
				const genres = $(element).find('.set').first().text().replace('Genres : ', '').trim();
				const statut = $(element).find('.set').eq(1).text().replace('Status : ', '').trim();
				const note = $(element).find('.set').eq(2).text().replace('Rating : ', '').trim() || 'Non disponible';
				listeAnimes.push({
					titre,
					lien,
					urlImage,
					genres,
					statut,
					note
				});
			});
			return listeAnimes;
		} catch (erreur) {
			console.error('Erreur lors de la récupération des données:', erreur);
			return { erreur: 'Erreur lors de la récupération des données' };
		}
	},
	
	// Récupère les détails d'un anime
	detail: async (url) => {
		try {
			const { data } = await axios.get(url);
			const $ = cheerio.load(data);
			
			// Extraction des informations avec traduction automatique des labels
			const extraireInfo = (motCle) => {
				const element = $(`.fotoanime .infozingle p span b:contains("${motCle}")`).parent();
				return element.text().replace(`${motCle}: `, '').trim();
			};
			
			const infoAnime = {
				titre: extraireInfo('Title') || extraireInfo('Titre'),
				titreJaponais: extraireInfo('Japanese'),
				score: extraireInfo('Score') || extraireInfo('Rating'),
				producteur: extraireInfo('Producer') || extraireInfo('Producteur'),
				type: extraireInfo('Type'),
				statut: extraireInfo('Status'),
				totalEpisodes: extraireInfo('Total Episode'),
				duree: extraireInfo('Duration') || extraireInfo('Durée'),
				dateSortie: extraireInfo('Release Date') || extraireInfo('Date de sortie'),
				studio: extraireInfo('Studio'),
				genres: extraireInfo('Genre'),
				urlImage: $('.fotoanime img').attr('src')
			};
			
			const episodes = [];
			$('.episodelist ul li').each((index, element) => {
				const titreEpisode = $(element).find('span a').text();
				const lienEpisode = $(element).find('span a').attr('href');
				const dateEpisode = $(element).find('.zeebr').text();
				episodes.push({ titre: titreEpisode, lien: lienEpisode, date: dateEpisode });
			});
			
			return {
				infoAnime,
				episodes
			};
		} catch (erreur) {
			console.error('Erreur lors de la récupération des données:', erreur);
			return { erreur: 'Erreur lors de la récupération des données' };
		}
	},
	
	// Récupère les liens de téléchargement d'un épisode
	telecharger: async (url) => {
		try {
			const { data } = await axios.get(url);
			const $ = cheerio.load(data);
			const infoEpisode = {
				titre: $('.download h4').text().trim(),
				telechargements: []
			};
			$('.download ul li').each((index, element) => {
				const qualite = $(element).find('strong').text().trim();
				const liens = $(element).find('a').map((i, el) => ({
					qualite,
					lien: $(el).attr('href'),
					hebergeur: $(el).text().trim()
				})).get();
				infoEpisode.telechargements.push(...liens);
			});
			return infoEpisode;
		} catch (erreur) {
			console.error('Erreur lors de la récupération des données:', erreur);
			return { erreur: 'Erreur lors de la récupération des données' };
		}
	}
};

module.exports = otakuDesu;