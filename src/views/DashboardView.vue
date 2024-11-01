<script setup>
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import { computed, ref } from 'vue'
import api from '@/main';

const submitted = ref(false)
const visible_import = ref(false)
const submitHandler = async (formData) => {
  const books_added = (await api.post("import-books/", formData)).data.books_added;
  if (books_added > 0) {
    alert(books_added + " books were added");
  } else {
    alert("No books were added. Either all books with these parameters are already imported or no books match the given parameters.");
  }
  visible_import.value = false
  submitted.value = true
}

const visible_issue = ref(false);
let books_for_issue = [];
let members_for_issue = [];
const click_issue = async () => {
  const books = (await api.get('books/'))['data'];
  const members = (await api.get('members/'))['data'];
  if (books.length == 0) {
    alert("Please add a book first");
  } else if (members.length == 0) {
    alert("Please add a member to issue a book to first");
  } else {
    books_for_issue = books.map(({ bookID, title }) => ({ bookID, title }));
    members_for_issue = members.map(({ id, name }) => ({ id, name }));
    visible_issue.value = true;
  }
};
const memberOptions = computed(() => {
  return members_for_issue.map(member => ({
    label: `${member.id}: ${member.name}`,
    value: member.id
  }));
});
const bookOptions = computed(() => {
  return books_for_issue.map(book => ({
    label: `${book.bookID}: ${book.title}`,
    value: book.bookID
  }));
});
const issueBook = async (formData) => {
  try {
    const response = await api.post('transactions/', formData);
    if (response.status == 201) {
      alert("Book issued successfully");
    }
  } catch (error) {
    alert("Something went wrong, perhaps member's debt is more than 500 or book is out of stock?")
  }
  visible_issue.value = false;
  submitted.value = true;
};

const selectedBook = ref(null);
const selectedTransaction = ref(null);
const visible_return = ref(false);
let members_for_return = [];
const books_for_return = ref([]);
const transactions_list = ref([]);
const click_return = async (member, book) => {
  const response = (await api.get('find-transactions/', {
    params: {
      member: member,
      book: book
    }
  }))['data'];
  if ("error" in response) {
    alert(response.error);
  } else if ("members" in response) {
    members_for_return = response.members.map(member => ({
      label: `${member.id}: ${member.name}`,
      value: member.id
    }));
    visible_return.value = true;
  } else if ("books" in response) {
    books_for_return.value = response.books.map(book => ({
      label: `${book.bookID}: ${book.title}`,
      value: book.bookID
    }));
    transactions_list.value = [];
    selectedBook.value = null;
    selectedTransaction.value = null;
  } else {
    transactions_list.value = response.transactions.map(transaction => ({
      label: `Transaction ID: ${transaction}`,
      value: transaction
    }));
  }
};
const returnBook = async () => {
  const response = await api.post(`transactions/${selectedTransaction.value}/return/`);
  if (response.status == 200) {
    alert(`Book returned successfully. ${response['data'].penalty_applied == true ? 'Late penalty was applied' : ''}`);
  } else {
    alert("Something went wrong...");
  }
  selectedBook.value = null;
  selectedTransaction.value = null;
  visible_return.value = false;
  members_for_return = [];
  books_for_return.value = [];
  transactions_list.value = [];
};
</script>

<template>
  <div>
    <div>
      <Button label="Import Books from Frappe API" size="large" severity="secondary" @click="visible_import = true" />
      <Button label="Issue a book" size="large" severity="secondary" style="margin-left: 18px;"
        @click="click_issue()" />
      <Button label="Issue a book return" size="large" severity="secondary" style="margin-left: 18px;"
        @click="click_return()" />
    </div>

    <Dialog v-model:visible="visible_import" modal header="Import Books from API" :style="{ width: '35rem' }">
      <FormKit type="form" :form-class="submitted ? 'hide' : 'show'" submit-label="Import" @submit="submitHandler"
        :actions="false">
        <FormKit type="text" name="title" label="Book Title" />
        <FormKit type="text" name="authors" label="Author" />
        <FormKit type="text" name="isbn" label="ISBN" />
        <FormKit type="text" name="publisher" label="Publisher" />
        <FormKit type="text" name="authors" label="Author" />
        <FormKit type="number" name="qty" number="integer" label="No. of books you want to import" />
        <FormKit type="submit" label="Import" />
      </FormKit>
    </Dialog>

    <Dialog v-model:visible="visible_issue" modal header="Issue a book" :style="{ width: '35rem' }">
      <FormKit type="form" :form-class="submitted ? 'hide' : 'show'" submit-label="Issue" @submit="issueBook"
        :actions="false">
        <FormKit type="select" name="member" label="Select member" :options="memberOptions" />
        <FormKit type="select" name="book" label="Select book" :options="bookOptions" />
        <FormKit type="submit" label="Issue" />
      </FormKit>
    </Dialog>

    <Dialog v-model:visible="visible_return" modal header="Return a book" :style="{ width: '35rem' }"
      @hide="books_for_return = []">
      <FormKit type="form" :form-class="submitted ? 'hide' : 'show'" submit-label="Return" @submit="returnBook"
        :actions="false" #default="{ value }">
        <FormKit type="select" name="member" label="Select member" :options="members_for_return"
          :placeholder="'Select member'" @change="click_return(member = value['member'])" />
        <FormKit type="select" v-model="selectedBook" name="book" label="Select book" :options="books_for_return"
          :disabled="books_for_return.length == 0" :placeholder="'Select book'"
          @change="click_return(member = value['member'], book = value['book'])" />
        <FormKit type="select" v-model="selectedTransaction" name="transaction" label="Select transaction"
          :options="transactions_list" :disabled="transactions_list.length == 0" :placeholder="'Select transaction'" />
        <FormKit type="submit" label="Return" :disabled="typeof value['transaction'] != 'number'" />
      </FormKit>
    </Dialog>
  </div>
</template>

<style scoped>
.max-w-\[20em\] {
  max-width: 100%;
}
</style>