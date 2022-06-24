/*
 *	COMPSCI 235 (2021) - University of Auckland
 *	ASSIGNMENT THREE - Client Side
 *	Simon Shan	441147157
 */

/**************************************************************
 *****                     FUNCTIONS                      *****
 **************************************************************/
function navigation(clicked) {
	let tabs = [...document.querySelectorAll('nav > *')];

	idx = tabs.indexOf(clicked);
	if (idx==4) {
		// show register popup
		document.querySelector('section.popup#register').style.display = 'block';
		// show shadow
		document.querySelector('div.shadow').style.display = 'block';
		return;
	}
	// clear previous tab classes
	tabs.forEach(tab => tab.className = '');
	// mark tabs
	tabs[idx-1].classList.add('before' );
	tabs[ idx ].classList.add('current');
	tabs[idx+1].classList.add('after'  );

	// hide and show sections
	let sections = [...document.querySelectorAll('main > section')];
	sections.forEach(section => section.classList.remove('current'));
	sections[idx-1].classList.add('current');
}

function comment() {
	let comment = document.querySelector('main section#guest-book textarea');
	let name = document.querySelector('main section#guest-book input[type=\'text\']');

	// post comment to server
	fetch('http://localhost:5000/api/WriteComment', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({
			'comment': comment.value,
			'name'   : name.value
		})
	}).catch(error => console.log(error));

	// clear inputs
	comment.value = '';
	name.value = '';

	// refresh iframe comment
	document.querySelector('main section#guest-book iframe').src += '';
}

async function register() {
	let username = document.querySelector('section#register input[type=\'text\']');
	let password = document.querySelector('section#register input[type=\'password\']');
	let address  = document.querySelector('section#register input[type=\'text\'].address');

	// authenticate credentials
	let crendentials = `${username.value}:${password.value}`;
	let token = `Basic ${btoa(crendentials)}`;

	await fetch('http://localhost:5000/api/Register', {
		headers: {
			'Content-Type': 'application/json'
		},
		method: 'POST',
		body: JSON.stringify({
			'username': username.value,
			'password': password.value,
			'address' : address.value
		})
	}).then(response => response.text())
	  .then(data => {
		if (data=='Username not available.') {
			username.value = '';
			password.value = '';
			document.querySelector('section#register input[type=\'submit\']').value = 'That username taken :(';
		}
		if (data=='Invalid username') {
			username.value = '';
			password.value = '';
			document.querySelector('section#register input[type=\'submit\']').value = 'A username is needed :(';
		}
		// if (data=='User successfully registered.') {
			// store credentials
			localStorage.setItem('username', username.value);
			localStorage.setItem('token', token);

			// close log in window
			document.querySelector('section#register').style.display = 'none';
			document.querySelector('div.shadow').style.display = 'none';

			// clear input credentials
			username.value = '';
			password.value = '';
			address.value = '';
			console.log(address.value)

			// update status indicator
			document.querySelector('nav footer p.status span.message').innerText = `Kia ora ${localStorage.getItem('username')}!`;
			document.querySelector('nav footer p.status span.indicator').style.color = 'var(--green)';
			document.querySelector('nav footer p.status span.logout').style.display = 'block';
		// }
	});
}

async function login() {
	let username = document.querySelector('section#login input[type=\'text\']');
	let password = document.querySelector('section#login input[type=\'password\']');

	// authenticate credentials
	let crendentials = `${username.value}:${password.value}`;
	let token = `Basic ${btoa(crendentials)}`;
	
	await fetch('http://localhost:5000/api/GetVersionA', {
		headers: {
			'Authorization': token
		}
	}).then(response => {
		if (response.status==200) {
			// store credentials
			localStorage.setItem('username', username.value);
			localStorage.setItem('token', token);

			// close log in window
			document.querySelector('section#login').style.display = 'none';
			// document.querySelector('div.shadow').style.display = 'none';

			// clear input credentials
			username.value = '';
			password.value = '';

			// update status indicator
			document.querySelector('nav footer p.status span.message').innerText = `Kia ora ${localStorage.getItem('username')}!`;
			document.querySelector('nav footer p.status span.indicator').style.color = 'var(--green)';
			document.querySelector('nav footer p.status span.logout').style.display = 'block';

		} else {
			password.value = '';
			document.querySelector('section#login input[type=\'submit\']').value = 'Whoops! Try again';
		}
	});
}

function logout() {
	// remove credentials
	localStorage.removeItem('username');
	localStorage.removeItem('token');

	// clear input credentials
	document.querySelector('section#login input[type=\'text\']').value = '';
	document.querySelector('section#login input[type=\'password\']').value = '';

	// update status indicator
	document.querySelector('nav footer p.status span.message').innerText = `not logged in`;
	document.querySelector('nav footer p.status span.indicator').style.color = 'var(--red)';
	document.querySelector('nav footer p.status span.logout').style.display = 'none';
}

function search(input) {
	let products = [...document.querySelectorAll('main section#shop div.card-table > div.card')];
	for (let product of products) {
		product.style.display = product.querySelector('h3.title')
								.innerText.toLowerCase().includes(input.value.toLowerCase()) ? '' : 'none';
	}
}

/**************************************************************
 *****                      SECTIONS                      *****
 **************************************************************/
function version() {
	fetch('http://localhost:5000/api/GetVersion')
		.then(response => response.text())
		.then(data => document.querySelector('main footer')
						.innerText += ` | Version ${data}`);
}

function staff() {
	fetch('http://localhost:5000/api/GetAllStaff')
		.then(response => response.json())
		.then(data => data.forEach(staff => {
			fetch(`http://localhost:5000/api/GetCard/${staff.id}`)
				.then(response => response.text())
				.then(vcard => {
					let fields = vcard.split('\n');
					for (let field of fields) {
						let [key, value] = field.split(':');
						switch (key) {
							case 'FN':
								staff.name = value;
								break;
							case 'EMAIL;TYPE=work':
								staff.email = value;
								break;
							case 'TEL':
								staff.tel = value;
								break;
							case 'CATEGORIES':
								staff.research = value;
								break;
						}
					}
					// staff.name  = fields[3].split(':')[1];
					// staff.email = fields[6].split(':')[1];
					// staff.tel   = fields[7].split(':')[1];
					// // staff.url   = fields[8].split(':')[1];
					// staff.research = fields[9].split(':')[1];

					// popup
					let photo = document.createElement('img');
					photo.src = `http://localhost:5000/api/GetStaffPhoto/${staff.id}`;

					let title = document.createElement('h3');
					title.classList.add('title');
					title.innerText = staff.name;

					let close = document.createElement('div');
					close.classList.add('close');

					let top = document.createElement('div');
					top.classList.add('top');
					top.append(title, close);

					let email = document.createElement('p');
					email.classList.add('email');
					email.innerText = staff.email;

					let phone = document.createElement('p');
					phone.classList.add('phone');
					phone.innerText = staff.tel;

					let linkedEmail = document.createElement('a');
					linkedEmail.href = `mailto:${staff.email}`;
					linkedEmail.append(email);

					let linkedPhone = document.createElement('a');
					linkedPhone.href = `tel:${staff.tel.replaceAll(' ', '')}`;
					linkedPhone.append(phone);

					let research = document.createElement('p');
					research.classList.add('research');
					research.innerText = staff.research.replaceAll(',', ', ');

					let button = document.createElement('h3');
					button.classList.add('button');
					button.innerText = 'Save to Contacts';

					let linkedButton = document.createElement('a');
					linkedButton.href = `http://localhost:5000/api/GetCard/${staff.id}`;
					linkedButton.download;
					linkedButton.append(button);

					let info = document.createElement('div');
					info.classList.add('staff-info');
					info.append(top, linkedEmail, linkedPhone, research, linkedButton);

					let popup = document.createElement('section');
					popup.classList.add('popup');
					popup.classList.add('staff');
					popup.style.display = 'none';
					popup.append(photo, info);

					// card
					let cardPhoto = document.createElement('img');
					cardPhoto.src = `http://localhost:5000/api/GetStaffPhoto/${staff.id}`;

					let cardTitle = document.createElement('h3');
					cardTitle.classList.add('title');
					cardTitle.innerText = staff.name;

					let card = document.createElement('div');
					card.classList.add('card');
					card.append(cardPhoto, cardTitle);

					// listeners
					close.addEventListener('click', () => {
						popup.style.display = 'none';
						document.querySelector('div.shadow').style.display = 'none';
					});

					card.addEventListener('click', () => {
						// clear other popups first
						let popups = [...document.querySelectorAll('section.popup')];
						popups.forEach(p => p.style.display = 'none');

						// show this popup
						popup.style.display = 'flex';

						// show shadow
						document.querySelector('div.shadow').style.display = 'block';
					});

					document.querySelector('main section#staff div.card-table').append(card);
					document.querySelector('body').append(popup);
				});
		}));
}

function shop() {
	fetch('http://localhost:5000/api/GetItems')
		.then(response => response.json())
		.then(data => data.forEach(product => {
			// popup
			let photo = document.createElement('img');
			photo.src = `http://localhost:5000/api/GetItemPhoto/${product.id}`;

			let title = document.createElement('h3');
			title.classList.add('title');
			title.innerText = product.name;

			let close = document.createElement('div');
			close.classList.add('close');
			// close.innerText = '×';

			let top = document.createElement('div');
			top.classList.add('top');
			top.append(title, close);

			let price = document.createElement('p');
			price.classList.add('price');
			price.innerText = '$' + product.price;

			let description = document.createElement('p');
			description.classList.add('description');
			description.innerText = product.description;

			let button = document.createElement('h3');
			button.classList.add('button');
			button.innerText = 'Buy, right now!';

			let count = 0;

			let message = document.createElement('p');
			message.classList.add('message');

			let info = document.createElement('div');
			info.classList.add('product-info');
			info.append(top, price, description, button, message);

			let popup = document.createElement('section');
			popup.classList.add('popup');
			popup.classList.add('product');
			popup.style.display = 'none';
			popup.append(photo, info);

			// card
			let cardPhoto = document.createElement('img');
			cardPhoto.src = `http://localhost:5000/api/GetItemPhoto/${product.id}`;

			let cardTitle = document.createElement('h3');
			cardTitle.classList.add('title');
			cardTitle.innerText = product.name;

			let card = document.createElement('div');
			card.classList.add('card');
			card.append(cardPhoto, cardTitle);

			// listeners
			close.addEventListener('click', () => {
				// clear message
				message.style.display = 'none';

				// clear other popups first
				let popups = [...document.querySelectorAll('section.popup')];
				popups.forEach(p => p.style.display = 'none');

				// clear this popup
				popup.style.display = 'none';

				// clear shadow
				document.querySelector('div.shadow').style.display = 'none';
			});

			button.addEventListener('click', () => {
				let username = localStorage.getItem('username');
				let token = localStorage.getItem('token');
				if (username && token) {
					fetch(`http://localhost:5000/api/PurchaseSingleItem/${product.id}`, {
						headers: {
							'Authorization': token
						}
					}).then(response => {
						if (response.status==201 || response.status==200) {
							count++;
							message.innerText = count>1 ?
								`Order successfullly placed! ×${count}`:
								'Order successfullly placed!';
							message.style.display = 'block';
						} else
							message.innerText = 'Something went wrong :(';
							message.style.display = 'block';
					})
				} else {
					// show login popup
					document.querySelector('section.popup#login').style.display = 'block';
					// show shadow
					document.querySelector('div.shadow').style.display = 'block';
				}
			});

			card.addEventListener('click', () => {
				// clear message
				message.style.display = 'none';

				// clear other popups first
				let popups = [...document.querySelectorAll('section.popup')];
				popups.forEach(p => p.style.display = 'none');

				// show this popup
				popup.style.display = 'flex';

				// show shadow
				document.querySelector('div.shadow').style.display = 'block';
			});

			document.querySelector('main section#shop div.card-table').append(card);
			document.querySelector('body').append(popup);
		}));
}

/**************************************************************
 *****                  MAIN STARTS HERE                  *****
 **************************************************************/
function main() {
	document.querySelector('section.popup#register div.close')
			.addEventListener('click', () => {
				// clear register popup
				document.querySelector('section.popup#register').style.display = 'none';
				document.querySelector('div.shadow').style.display = 'none';
			});
	document.querySelector('section.popup#login div.close')
			.addEventListener('click', () => {
				// clear login popup
				document.querySelector('section.popup#login').style.display = 'none';
			});

	// clear credentials from localStorage
	localStorage.removeItem('username');
	localStorage.removeItem('token');

	version();
	staff();
	shop();

	navigation(document.querySelector('nav h2'));
}

main();
